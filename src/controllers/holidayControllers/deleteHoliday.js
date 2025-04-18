import Joi from "joi";
import Holiday from "../../models/holidayModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const holiday = await Holiday.findByPk(id);
            if (!holiday) {
                return responseHandler.success(res, 'Holiday not found');
            }
            await holiday.destroy();
            return responseHandler.success(res, 'Holiday deleted successfully', holiday);
        }
        catch (error) {
            return responseHandler.error(res, error)
        }
    }
}