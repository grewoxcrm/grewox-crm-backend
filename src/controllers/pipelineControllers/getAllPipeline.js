import Joi from "joi";
import Pipeline from "../../models/pipelineModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Role from "../../models/roleModel.js";
import User from "../../models/userModel.js";
import { seedDefaultPipelines } from "./createPipeline.js";
import { seedDefaultStages } from "../stageControllers/createStage.js";

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
            let pipelines;
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

            // Get existing pipelines
            pipelines = await Pipeline.findAll({
                where: { client_id }
            });

            if (pipelines.length === 0) {
                pipelines = await seedDefaultPipelines(client_id, req.user.username);

                for (const pipeline of pipelines) {
                    await seedDefaultStages(
                        pipeline.id,
                        client_id,
                        req.user.username
                    );
                }
            }

            return responseHandler.success(res, "Pipelines fetched successfully", pipelines);

        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}