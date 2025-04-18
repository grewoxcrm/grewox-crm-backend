import Joi from "joi";
import SubscriptionPlan from "../../models/subscriptionPlanModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().optional()
        }),
        body: Joi.object({
            name: Joi.string().optional(),
            currency: Joi.string().optional(),
            price: Joi.string().optional(),
            duration: Joi.string().optional(),
            trial_period: Joi.string().optional(),
            status: Joi.string().valid('active', 'inactive').optional(),
            max_users: Joi.string().optional(),
            max_clients: Joi.string().optional(),
            storage_limit: Joi.string().optional(),
            features: Joi.object().optional().allow(null),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, currency, price, duration, trial_period, max_users, max_clients, storage_limit, features, status } = req.body;

            const plan = await SubscriptionPlan.findByPk(id);
            if (!plan) {
                return responseHandler.notFound(res, "Plan not found");
            }

            const existingPlan = await SubscriptionPlan.findOne({ where: { name, id: { [Op.not]: id } } });
            if (existingPlan) {
                return responseHandler.error(res, "Plan already exists");
            }

            await plan.update({ name, currency, price, duration, trial_period, max_users, max_clients, storage_limit, features, status, updated_by: req.user?.username });

            return responseHandler.success(res, "Plan updated successfully", plan);
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
}; 