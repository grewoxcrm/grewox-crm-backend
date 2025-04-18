import Joi from "joi";
import BillDebitnote from "../../models/billdebitnoteModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const billDebitnote = await BillDebitnote.findByPk(id);
            if (!billDebitnote) {
                return responseHandler.error(res, "BillDebitnote not found");
            }
            await billDebitnote.destroy();
            return responseHandler.success(res, "BillDebitnote deleted successfully", billDebitnote);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}   