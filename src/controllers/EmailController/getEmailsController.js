import Email from "../../models/emailModel.js";
import Role from "../../models/roleModel.js";
import User from "../../models/userModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Joi from "joi";
import { Op } from "sequelize";

export default {
    validator: validator({
        query: Joi.object({
            type: Joi.string().valid('inbox', 'sent', 'trash', 'starred', 'important', 'scheduled').optional()
        })
    }),

    handler: async (req, res) => {
        try {
            const { type } = req.query;
            const userRole = req.user.role;
            let whereClause = {};

            if (type === 'inbox') {
                whereClause.type = { [Op.ne]: 'trash' };
            } else if (type === 'sent') {
                whereClause.type = 'sent';
            } else if (type === 'starred') {
                whereClause.isStarred = true;
                whereClause.type = { [Op.ne]: 'trash' };
            } else if (type === 'important') {
                whereClause.isImportant = true;
                whereClause.type = { [Op.ne]: 'trash' };
            } else if (type === 'scheduled') {
                whereClause.status = 'scheduled';
                whereClause.scheduledFor = { [Op.gt]: new Date() };
            } else if (type === 'trash') {
                whereClause.type = 'trash';
            }

            const role = await Role.findOne({ where: { id: userRole } });
            if (!role) {
                return responseHandler.error(res, "Role not found");
            }

            let emails;
            if (role.role_name === 'super-admin' || role.role_name === 'client') {
                emails = await Email.findAll({
                    where: {
                        ...whereClause,
                        client_id: req.user.id
                    },
                    order: [['createdAt', 'DESC']]
                });
            } else {
                const user = await User.findOne({ where: { id: req.user.id } });
                if (!user) {
                    return responseHandler.error(res, "User not found");
                }

                emails = await Email.findAll({
                    where: {
                        ...whereClause,

                        client_id: user.client_id
                    },
                    order: [['createdAt', 'DESC']]
                });
            }

            return responseHandler.success(res, "Emails fetched successfully", emails);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};