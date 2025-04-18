import Joi from "joi";
import Bill from "../../models/billModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            vendor: Joi.string().required(),
            billDate: Joi.date().required(),
            discription: Joi.string().required(),
            status: Joi.string().optional(),
            discount: Joi.number().optional(),
            tax: Joi.number().optional(),
            currency: Joi.string().optional(),
            items: Joi.array().required(),
            total: Joi.number().required(),
            note: Joi.string().optional(),
            subTotal: Joi.number().required(),
            

        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { vendor, billDate, discription, status, discount, tax, currency, items, total, note, subTotal } = req.body;

            const upiLink = `upi://pay?pa=${process.env.UPI_ID}&pn=${process.env.MERCHANT_NAME}&am=${total}&cu=INR`;

            
            // Determine bill_status based on total and updated total amounts
            const newBill = await Bill.create({ 
                related_id: id,
                vendor,
                billDate,
                discription,
                status,
                discount,
                tax, 
                currency,
                upiLink,
                items,
                amount: total,
                total,
                note,
                subTotal,
                bill_status: 'draft',
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });

           

            return responseHandler.success(res, "Bill created successfully", newBill);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
