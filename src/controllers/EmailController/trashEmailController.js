import Email from "../../models/emailModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Joi from "joi";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),

    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const email = await Email.findOne({ where: { id } });

            if (!email) {
                return responseHandler.error(res, "Email not found");
            }

            await email.update({ 
                isTrash: true,
                type: 'trash',
                updated_by: req.user?.username 
            });

            return responseHandler.success(res, "Email moved to trash", email);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};