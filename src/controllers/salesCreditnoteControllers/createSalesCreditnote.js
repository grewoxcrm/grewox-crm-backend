import Joi from "joi";
import SalesCreditnote from "../../models/salesCreditnoteModel.js";
import SalesInvoice from "../../models/salesInvoiceModel.js";
import SalesRevenue from "../../models/salesRevenueModel.js";
import Product from "../../models/productModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import uploadToS3 from "../../utils/uploadToS3.js";
import Activity from "../../models/activityModel.js";

export default {
  validator: validator({
    body: Joi.object({
      invoice: Joi.string().required(),
      date: Joi.date().optional(),
      currency: Joi.string().optional(),
      amount: Joi.number().required(),
      description: Joi.string().optional().allow("", null),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.user;
      const { invoice, date, currency, amount, description } = req.body;

      // Find the related sales invoice
      const salesInvoice = await SalesInvoice.findByPk(invoice);
      if (!salesInvoice) {
        return responseHandler.error(res, "Sales Invoice not found");
      }

      // Get existing credit notes total for this invoice
      const existingCreditNotes = await SalesCreditnote.findAll({
        where: { invoice }
      });
      const totalCreditedAmount = existingCreditNotes.reduce((sum, note) => sum + note.amount, 0);

      // Check if credit amount is valid (including existing credit notes)
      const remainingInvoiceAmount = salesInvoice.total - totalCreditedAmount;
      if (amount > remainingInvoiceAmount) {
        return responseHandler.error(
          res,
          `Credit amount cannot be greater than remaining invoice amount (${remainingInvoiceAmount})`
        );
      }

      // Parse invoice items
      const invoiceItems = JSON.parse(salesInvoice.items);

      // Check product stock availability before proceeding
      const newTotalCredited = totalCreditedAmount + amount;
      if (newTotalCredited >= salesInvoice.total) {
        // Only check stock if this credit note will complete the invoice
        for (const item of invoiceItems) {
          const product = await Product.findByPk(item.product_id);
          if (!product) {
            return responseHandler.error(res, `Product with ID ${item.product_id} not found`);
          }

          if (product.stock_quantity < item.quantity) {
            return responseHandler.error(
              res,
              `Insufficient stock for product ${product.name}. Available: ${product.stock_quantity}, Required: ${item.quantity}`
            );
          }
        }
      }

      // Handle file upload to S3
      let attachmentUrl = null;
      if (req.file) {
        attachmentUrl = await uploadToS3(
          req.file,
          "client",
          "creditnotes",
          req.user?.username
        );
      }

      // Calculate proportional amounts for each item based on credit note amount
      const creditNoteItems = invoiceItems.map(item => {
        const itemPercentage = item.total / salesInvoice.total;
        const itemCreditAmount = amount * itemPercentage;
        const itemCostPercentage = item.buying_price / item.unit_price;
        const itemCreditCost = itemCreditAmount * itemCostPercentage;

        return {
          ...item,
          credit_amount: itemCreditAmount,
          credit_cost: itemCreditCost,
          credit_profit: itemCreditAmount - itemCreditCost,
          credit_profit_percentage: ((itemCreditAmount - itemCreditCost) / itemCreditCost * 100).toFixed(2)
        };
      });

      // Create credit note
      const salesCreditnote = await SalesCreditnote.create({
        related_id: id,
        invoice,
        date: date || new Date(),
        currency: currency || salesInvoice.currency,
        amount,
        description,
        items: creditNoteItems,
        attachment: attachmentUrl,
        client_id: req.des?.client_id,
        created_by: req.user?.username,
      });

      // Calculate new total and determine payment status
      const newTotal = salesInvoice.total;
      const newAmount = salesInvoice.amount - amount;

      let newPaymentStatus = salesInvoice.payment_status;
      let shouldCreateRevenue = false;
      let shouldUpdateStock = false;

      // If total credited equals invoice total, mark as paid
      if (newTotalCredited >= salesInvoice.total) {
        newPaymentStatus = 'paid';
        shouldCreateRevenue = true;
        shouldUpdateStock = true;
      }
      // If some amount is credited but not full, mark as partially_paid
      else if (newTotalCredited > 0) {
        newPaymentStatus = 'partially_paid';
      }

      // Update invoice
      await salesInvoice.update({
        amount: newAmount,
        payment_status: newPaymentStatus
      });

      // Update product stock if credit note completes the invoice
      if (shouldUpdateStock) {
        for (const item of invoiceItems) {
          const product = await Product.findByPk(item.product_id);
          if (product) {
            await product.update({
              stock_quantity: product.stock_quantity - item.quantity,
              updated_by: req.user?.username
            });
          }
        }
      }

      // If status becomes paid, create revenue entry
      if (shouldCreateRevenue) {
        // Calculate totals for revenue
        const totalCost = creditNoteItems.reduce((sum, item) => sum + item.credit_cost, 0);
        const totalProfit = amount - totalCost;
        const profitPercentage = (totalProfit / totalCost * 100).toFixed(2);

        await SalesRevenue.create({
          related_id: id,
          date: date || new Date(),
          currency: currency || salesInvoice.currency,
          amount: amount,
          cost_of_goods: totalCost,
          account: 'sales_credit',
          customer: salesInvoice.customer,
          description: `Credit Note for Invoice #${invoice}`,
          category: salesInvoice.category || 'Sales Credit',
          products: creditNoteItems.map(item => ({
            ...item,
            revenue: item.credit_amount
          })),
          client_id: req.des?.client_id,
          created_by: req.user?.username,
        });
      }

      // Log activity
      await Activity.create({
        related_id: id,
        activity_from: "sales_creditnote",
        activity_id: salesCreditnote.id,
        action: "created",
        performed_by: req.user?.username,
        client_id: req.des?.client_id,
        activity_message: `Credit note of ${amount} ${currency || salesInvoice.currency} created for invoice #${invoice}. New invoice balance: ${newAmount}. Status changed to: ${newPaymentStatus}${shouldUpdateStock ? '. Stock updated for products.' : ''}`
      });

      return responseHandler.success(
        res,
        "Sales Credit Note created successfully",
        {
          creditNote: salesCreditnote,
          updatedInvoice: {
            id: salesInvoice.id,
            previousAmount: salesInvoice.amount,
            newAmount: newAmount,
            creditedAmount: amount,
            totalCreditedAmount: newTotalCredited,
            previousStatus: salesInvoice.payment_status,
            newStatus: newPaymentStatus,
            items: creditNoteItems,
            stockUpdated: shouldUpdateStock
          }
        }
      );
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
