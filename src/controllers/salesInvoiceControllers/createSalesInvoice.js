import Joi from "joi";
import SalesInvoice from "../../models/salesInvoiceModel.js";
import Product from "../../models/productModel.js";
import SalesRevenue from "../../models/salesRevenueModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Activity from "../../models/activityModel.js";
import Notification from "../../models/notificationModel.js";
import dayjs from "dayjs";


export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
    
        body: Joi.object({
            customer: Joi.string().required(),
            issueDate: Joi.date().required(),
            dueDate: Joi.date().required(),
            category: Joi.string().optional().allow("", null),
            items: Joi.array().items(
                Joi.object({
                    product_id: Joi.string().required(),
                    quantity: Joi.number().integer().min(1).required(),
                    unit_price: Joi.number().min(0).required(),
                    tax_rate: Joi.number().min(0).optional(),
                    discount: Joi.number().min(0).optional()
                })  
            ).required().min(1),
            payment_status: Joi.string().valid('paid', 'unpaid', 'partially_paid').default('unpaid'),
            currency: Joi.string().required(),
            additional_notes: Joi.string().optional().allow("", null)
        })
    }),
    handler: async (req, res) => {
        try {
            const { 
                customer, 
                issueDate, 
                dueDate, 
                category, 
                items,
                payment_status,
                currency,
                additional_notes
            } = req.body;
            const {id} = req.params;

            // Calculate costs and verify products
            let total_cost_of_goods = 0;
            let subtotal = 0;
            let total_tax = 0;
            let total_discount = 0;
            let verified_products = [];

            // Verify and process each product
            for (const item of items) {
                const product = await Product.findByPk(item.product_id);
                if (!product) {
                    return responseHandler.error(res, `Product with ID ${item.product_id} not found`);
                }

                // Verify stock availability
                if (product.stock_quantity < item.quantity) {
                    return responseHandler.error(res, `Insufficient stock for product ${product.name}`);
                }

                // // Verify selling price is not less than buying price
                // if (item.unit_price < product.buying_price) {
                //     return responseHandler.error(res, `Selling price (${item.unit_price}) cannot be less than buying price (${product.buying_price}) for product ${product.name}`);
                // }

                // Calculate item level metrics
                const item_cost = product.buying_price * item.quantity;
                const item_subtotal = item.unit_price * item.quantity;
                const item_tax = item.tax_rate ? (item_subtotal * item.tax_rate / 100) : 0;
                
                // Calculate discount
                const item_discount = item.discount || 0;
                const item_discount_type = item.discount_type || 'percentage';
                let item_discount_amount = 0;

                if (item_discount_type === 'percentage') {
                    item_discount_amount = (item_subtotal * item_discount) / 100;
                } else {
                    item_discount_amount = item_discount;
                }

                const item_total = item_subtotal + item_tax - item_discount_amount;
                const item_profit = item_total - item_cost;
                const item_profit_percentage = item_cost > 0 ? ((item_profit) / item_cost) * 100 : 0;

                // Update running totals
                total_cost_of_goods += item_cost;
                subtotal += item_subtotal;
                total_tax += item_tax;
                total_discount += item_discount_amount;

                // Add to verified products
                verified_products.push({
                    ...item,
                    name: product.name,
                    buying_price: product.buying_price,
                    subtotal: item_subtotal,
                    tax_amount: item_tax,
                    discount_amount: item_discount_amount,
                    total: item_total,
                    profit: item_profit,
                    profit_percentage: item_profit_percentage.toFixed(2)
                });

                // Update product stock if invoice is marked as paid
                if (payment_status === 'paid') {
                    await product.update({
                        stock_quantity: product.stock_quantity - item.quantity,
                        updated_by: req.user?.username
                    });
                }
            }


            // Calculate final totals
            const total = subtotal + total_tax - total_discount;
            const total_profit = total - total_cost_of_goods;
            const profit_percentage = total_cost_of_goods > 0 ? (total_profit / total_cost_of_goods) * 100 : 0;

            const upiLink = `upi://pay?pa=${process.env.UPI_ID}&pn=${process.env.MERCHANT_NAME}&am=${total}&cu=INR`;

            
            // Create invoice
            const salesInvoice = await SalesInvoice.create({ 
                related_id: id,
                customer,
                issueDate,
                dueDate,
                category,
                items: verified_products,
                payment_status,
                currency,
                subtotal,
                tax: total_tax,
                discount: total_discount,
                amount: total,
                total,
                cost_of_goods: total_cost_of_goods,
                profit: total_profit,
            profit_percentage: profit_percentage.toFixed(2),
                additional_notes,
                upiLink,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });

            // Create single reminder notification for due date
            await Notification.create({
                related_id: salesInvoice.id,
                users: [customer],
                title: "Invoice Due Today",
                notification_type: "reminder",
                from: req.user?.id,
                client_id: req.des?.client_id,
                date: dueDate,
                time: "10:00:00", // Set for 10 AM on due date
                message: `Invoice #${salesInvoice.id} is due today`,
                description: `⚠️ Invoice Payment Due:
• Invoice #: ${salesInvoice.id}
• Amount Due: ${total} ${currency}
• Due Date: ${dueDate}
• Status: ${payment_status}
• Items: ${verified_products.length}

Please ensure timely payment to avoid any late fees.`,
                created_by: req.user?.username,
            });

            // If invoice is marked as paid, create sales revenue entry
            if (payment_status === 'paid') {
                await SalesRevenue.create({
                    related_id: id,
                    date: issueDate,
                    currency,
                    amount: total,
                    cost_of_goods: total_cost_of_goods,
                    account: 'sales',
                    customer,
                    description: `Payment for Invoice #${salesInvoice.salesInvoiceNumber}`,
                    category: category || 'Sales',
                    products: verified_products.map(item => ({
                        ...item,
                        revenue: item.total
                    })),
                    client_id: req.des?.client_id,
                    created_by: req.user?.username,
                });
            }

            // Log activity
            await Activity.create({
                related_id: id,
                activity_from: "sales_invoice",
                activity_id: salesInvoice.id,
                action: "created",
                performed_by: req.user?.username,
                client_id: req.des?.client_id,
                activity_message: `Sales invoice #${salesInvoice.salesInvoiceNumber} created for `
            });

            // After creating the sales invoice, add this code:
            if (payment_status === 'unpaid') {
                // Create reminder for due date
                await Notification.create({
                    related_id: salesInvoice.id,
                    users: [customer],
                    title: "Invoice Due Date Reminder",
                    notification_type: "reminder",
                    from: req.user?.id,
                    client_id: req.des?.client_id,
                    date: dueDate,
                    time: "09:00",
                    message: `Invoice #${salesInvoice.salesInvoiceNumber} is due today`,
                    description: `💰 Invoice Due Today:
• Invoice #: ${salesInvoice.salesInvoiceNumber}
• Amount: ${total} ${currency}
• Due Date: ${dueDate}
• Customer: ${customer}
• Status: ${payment_status}`,
                    created_by: req.user?.username,
                });

                // Create reminder for day before due date
                const dayBeforeDue = dayjs(dueDate).subtract(1, 'day').format('YYYY-MM-DD');
                await Notification.create({
                    related_id: salesInvoice.id,
                    users: [customer],
                    title: "Invoice Due Tomorrow",
                    notification_type: "reminder",
                    from: req.user?.id,
                    client_id: req.des?.client_id,
                    date: dayBeforeDue,
                    time: "09:00",
                    message: `Invoice #${salesInvoice.salesInvoiceNumber} is due tomorrow`,
                    description: `💰 Invoice Due Tomorrow:
• Invoice #: ${salesInvoice.salesInvoiceNumber}
• Amount: ${total} ${currency}
• Due Date: ${dueDate}
• Customer: ${customer}
• Status: ${payment_status}`,
                    created_by: req.user?.username,
                });
            }

            return responseHandler.success(res, "Sales invoice created successfully", {
                ...salesInvoice.toJSON(),
                metrics: {
                    subtotal,
                    tax: total_tax,
                    discount: total_discount,
                    total,
                    cost_of_goods: total_cost_of_goods,
                    profit: total_profit,
                    profit_percentage: profit_percentage.toFixed(2)
                }
            });
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};
