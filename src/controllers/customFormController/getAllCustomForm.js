import Joi from "joi";
import validator from "../../utils/validator.js";
import CustomForm from "../../models/customFormModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Role from "../../models/roleModel.js";
import User from "../../models/userModel.js";

export default {
    validator: validator({
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const userRole = req.user.role;
            let customForms;

            // Find role in role model
            const role = await Role.findOne({
                where: { id: userRole }
            });

            if (!role) {
                return responseHandler.error(res, "Role not found");
            }

            if (role.role_name === 'super-admin') {
                // If user is super-admin, get all custom forms
                customForms = await CustomForm.findAll({
                    where: {
                        client_id: req.user.id
                    }
                });
            } else if (role.role_name === 'client') {
                // If user is client, find custom forms matching their client_id
                customForms = await CustomForm.findAll({
                    where: {
                        client_id: req.user.id
                    }
                });
            } else {
                // For other roles, get client_id from user model
                const user = await User.findOne({
                    where: { id: req.user.id }
                });

                if (!user) {
                    return responseHandler.error(res, "User not found");
                }

                customForms = await CustomForm.findAll({
                    where: {
                        client_id: user.client_id
                    }
                });
            }

            return responseHandler.success(res, "Custom forms fetched successfully", customForms);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
