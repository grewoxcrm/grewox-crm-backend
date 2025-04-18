import Joi from "joi";
import Payment from "../../models/paymentModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { s3 } from "../../config/config.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const payment = await Payment.findByPk(id);
            if (!payment) {
                return responseHandler.error(res, "Payment not found", 404);
            }
            const receipt = payment.receipt;
            if (receipt) {
                const key = decodeURIComponent(receipt.split(".com/").pop());
                const s3Params = {
                    Bucket: s3.config.bucketName,
                    Key: key,
                };
                await s3.deleteObject(s3Params).promise();
            }
            await payment.destroy();
            return responseHandler.success(res, "Payment deleted successfully", payment);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};