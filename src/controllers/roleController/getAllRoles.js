// import Joi from "joi";
// import Role from "../../models/roleModel.js";
// import validator from "../../utils/validator.js";
// import responseHandler from "../../utils/responseHandler.js";

// export default {
//     validator: validator({
//         query: Joi.object({
//             page: Joi.number().optional(),
//             limit: Joi.number().optional()
//         })
//     }),
//     handler: async (req, res) => {
//         try {
//             const roles = await Role.findAll();
//             return responseHandler.success(res, 'Roles fetched successfully', roles);
//         } catch (error) {
//             return responseHandler.error(res, error?.message);
//         }
//     }
// }









import Joi from "joi";
import Role from "../../models/roleModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import User from "../../models/userModel.js";
import { Op } from "sequelize";

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
            let roles;

            // Find role in role model
            const role = await Role.findOne({
                where: { id: userRole }
            });

            if (!role) {
                return responseHandler.error(res, "Role not found");
            }

            if (role.role_name === 'super-admin') {
                // If user is super-admin, get all roles
                roles = await Role.findAll();
            } else if (role.role_name === 'client') {
                // If user is client, find projects matching their client_id
                roles = await Role.findAll(
                    {
                        where: {
                            
                            client_id: req.user.id
                        }
                    }
                );
            } else {
                // For other roles, get client_id from user model
                const user = await User.findOne({
                    where: { id: req.user.id }
                });

                if (!user) {
                    return responseHandler.error(res, "User not found");
                }

                roles = await Role.findAll({
                    where: {
                        client_id: user.client_id
                    }
                });
            }

            return responseHandler.success(res, "Roles fetched successfully", roles);
        }
        catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}