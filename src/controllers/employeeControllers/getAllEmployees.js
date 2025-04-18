import Joi from "joi";
import User from "../../models/userModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Role from "../../models/roleModel.js";
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
            let employees;

            // Find role in role model
            const role = await Role.findOne({
                where: { id: userRole }
            });

            if (!role) {
                return responseHandler.error(res, "Role not found");
            }
            if (role.role_name === 'super-admin') {
                // If user is super-admin, get all employees
                employees = await User.findAll();
                
            } else if (role.role_name === 'client') {
                // If user is client, find projects matching their client_id
                employees = await User.findAll({
                    where: {
                        client_id: req.user.id,
                        employeeId: {
                            [Op.not]: null
                        }
                    }
                });
            } else {
                // For other roles, get client_id from user model
                const user = await User.findOne({
                    where: { id: req.user.id }
                });

                if (!user) {
                    return responseHandler.error(res, "Employee not found");
                }

                employees = await User.findAll({
                    where: {
                        client_id: user.client_id,
                        employeeId: {
                            [Op.not]: null
                        }
                    }
                });
            }

            return responseHandler.success(res, "Employees fetched successfully", employees);

        } catch (error) {
            return responseHandler.error(res, error,'Error fetching employees');
        }
    }
};
