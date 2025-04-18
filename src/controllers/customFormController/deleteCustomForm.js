import Joi from "joi";
import validator from "../../utils/validator.js";
import CustomForm from "../../models/customFormModel.js";
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
            const customForm = await CustomForm.findOne({
                where: {
                    id,
                    client_id: req.des?.client_id
                }
            });

            if (!customForm) {
                return responseHandler.error(res, "Custom form not found", 404);
            }

            await customForm.destroy();
            return responseHandler.success(res, "Custom form deleted successfully");
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
