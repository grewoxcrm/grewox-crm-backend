import Joi from "joi";
import SubscriptionPlan from "../../models/subscriptionPlanModel.js";
import validator from "../../utils/validator.js";
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

            const plan = await SubscriptionPlan.findByPk(id);
            if (!plan) {
                return responseHandler.notFound(res, "Plan not found");
            }

            await plan.destroy();

            return responseHandler.success(res, "Plan deleted successfully", plan);
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
}; 