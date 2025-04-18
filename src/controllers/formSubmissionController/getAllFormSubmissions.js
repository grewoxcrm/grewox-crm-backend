import Joi from "joi";
import validator from "../../utils/validator.js";
import FormSubmission from "../../models/formSubmissionModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Role from "../../models/roleModel.js";
import User from "../../models/userModel.js";

export default {
    validator: validator({
        params: Joi.object({
            formId: Joi.string().required()
        }),
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const { formId } = req.params;
            const userRole = req.user.role;
            let submissions;

            // Find role in role model
            const role = await Role.findOne({
                where: { id: userRole }
            });

            if (!role) {
                return responseHandler.error(res, "Role not found");
            }

            if (role.role_name === 'client') {
                // If user is client, find submissions matching their client_id
                submissions = await FormSubmission.findAll({
                    where: {
                        form_id: formId,
                        client_id: req.user.id
                    },
                    order: [['createdAt', 'DESC']]
                });
            } else {
                // For other roles, get client_id from user model
                const user = await User.findOne({
                    where: { id: req.user.id }
                });

                if (!user) {
                    return responseHandler.error(res, "User not found");
                }

                submissions = await FormSubmission.findAll({
                    where: {
                        form_id: formId,
                        client_id: user.client_id
                    },
                    order: [['createdAt', 'DESC']]
                });
            }

            return responseHandler.success(res, "Form submissions fetched successfully", submissions);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};