import FollowupMetting from "../../models/followupMettingModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Joi from "joi";
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

            const followupMetting = await FollowupMetting.findByPk(id);
            if (!followupMetting) {
                return responseHandler.error(res, "Followup meeting not found");
            }

            await FollowupMetting.destroy({
                where: { id }
            });

            return responseHandler.success(res, "Followup meeting deleted successfully");
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
} 