import Joi from "joi";
import BillDebitnote from "../../models/billdebitnoteModel.js";
import Bill from "../../models/billModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            bill: Joi.string().required(),
            date: Joi.date().required(), 
            currency: Joi.string().optional(),
            amount: Joi.number().required(),
            description: Joi.string().optional().allow('', null),
        })
    }),
    handler: async (req, res) => {
        try {
          
            const { bill, date, amount, description, currency } = req.body;

            // Find the bill in bill model
            const billData = await Bill.findOne({ 
                where: { 
                    id: bill,
                } 
            });
            
            if (!billData) {
                return responseHandler.error(res, "Bill not found");
            }

            // Get existing debit notes total for this bill
            const existingDebitNotes = await BillDebitnote.findAll({
                where: { bill }
            });
            const totalDebitedAmount = existingDebitNotes.reduce((sum, note) => sum + note.amount, 0);

            // Check if debit amount is valid (including existing debit notes)
            const remainingBillAmount = billData.total - totalDebitedAmount;
            if (amount > remainingBillAmount) {
                return responseHandler.error(
                    res,
                    `Debit amount cannot be greater than remaining bill amount (${remainingBillAmount})`
                );
            }

            // Create debit note
            const billDebitnote = await BillDebitnote.create({ 
                bill, 
                date, 
                currency, 
                amount, 
                description, 
                client_id: req.des?.client_id,
                created_by: req.user?.username 
            });

            // Calculate new total and determine payment status
            const newTotal = billData.total;
            const newAmount = billData.amount - amount;
            const newTotalDebited = totalDebitedAmount + amount;

            let newPaymentStatus = billData.status;

            // If total debited equals bill total, mark as paid
            if (newTotalDebited >= billData.total) {
                newPaymentStatus = 'paid';
            }
            // If some amount is debited but not full, mark as partially_paid
            else if (newTotalDebited > 0) {
                newPaymentStatus = 'partially_paid';
            }

            // Update bill
            await billData.update({
                amount: newAmount,
                status: newPaymentStatus
            });

            return responseHandler.success(res, "Bill Debit Note created successfully", {
                debitNote: billDebitnote,
                updatedBill: {
                    id: billData.id,
                    previousAmount: billData.amount,
                    newAmount: newAmount,
                    debitedAmount: amount,
                    totalDebitedAmount: newTotalDebited,
                    previousStatus: billData.status,
                    newStatus: newPaymentStatus
                }
            });
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}