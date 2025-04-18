import Joi from "joi";
import Stage from "../../models/stageModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Role from "../../models/roleModel.js";
import User from "../../models/userModel.js";
import { seedDefaultStages } from "./createStage.js";
import Pipeline from "../../models/pipelineModel.js";

export default {
    validator: validator({
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        })
    }),
    handler: async (req, res) => {
        try {
            const userRole = req.user.role;
            let stages;
            let client_id;

            // Find role in role model
            const role = await Role.findOne({
                where: { id: userRole }
            });

            if (!role) {
                return responseHandler.error(res, "Role not found");
            }

            if (role.role_name === 'client') {
                client_id = req.user.id;
            } else {
                const user = await User.findOne({
                    where: { id: req.user.id }
                });

                if (!user) {
                    return responseHandler.error(res, "User not found");
                }
                client_id = user.client_id;
            }

            // Get existing stages
            stages = await Stage.findAll({
                where: { client_id }
            });

            if (stages.length === 0) {
                // Get all pipelines first
                const pipelines = await Pipeline.findAll({
                    where: { client_id }
                });

                // Create stages for each pipeline
                const allStages = [];
                for (const pipeline of pipelines) {
                    const pipelineStages = await seedDefaultStages(pipeline.id, client_id, req.user.username);
                    allStages.push(...pipelineStages);
                }
                stages = allStages;
            }

            return responseHandler.success(res, "Stages fetched successfully", stages);

        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
