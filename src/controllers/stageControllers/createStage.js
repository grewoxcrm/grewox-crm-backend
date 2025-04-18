import Joi from "joi";
import Stage from "../../models/stageModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Pipeline from "../../models/pipelineModel.js";

const defaultStages = {
    sales: [
        { stageName: "New Lead", stageType: "lead" },
        { stageName: "Qualified", stageType: "lead" },
        { stageName: "Negotiation", stageType: "lead" },
        { stageName: "Closed Won", stageType: "lead" },
        { stageName: "Initial Contact", stageType: "deal" },
        { stageName: "Meeting Scheduled", stageType: "deal" },
        { stageName: "Proposal Made", stageType: "deal" },
        { stageName: "Contract Sent", stageType: "deal" }
    ],
    marketing: [
        { stageName: "Lead Received", stageType: "deal" },
        { stageName: "Initial Contact", stageType: "deal" },
        { stageName: "Proposal Sent", stageType: "deal" },
        { stageName: "Deal Closed", stageType: "deal" },
        { stageName: "New Lead", stageType: "lead" },
        { stageName: "Lead Qualified", stageType: "lead" },
        { stageName: "Marketing Engaged", stageType: "lead" },
        { stageName: "Campaign Active", stageType: "lead" }
    ],
};

export const seedDefaultStages = async (pipeline_id, client_id, username) => {
    try {
        // Check if stages already exist for this pipeline
        const existingStages = await Stage.findAll({
            where: { pipeline: pipeline_id, client_id },
        });

        if (existingStages.length === 0) {
            const pipeline = await Pipeline.findByPk(pipeline_id);
            if (!pipeline) return [];

            // Determine which default stages to use based on pipeline name
            const pipelineType = pipeline.pipeline_name.toLowerCase();
            const stagesToCreate = defaultStages[pipelineType] || [];

            const createdStages = await Promise.all(
                stagesToCreate.map(async (stage) => {
                    try {
                        return await Stage.create({
                            stageName: stage.stageName,
                            stageType: stage.stageType,
                            pipeline: pipeline_id,
                            order: stage.order,
                            client_id,
                            created_by: username
                        });
                    } catch (error) {
                        console.error("Error creating stage:", error);
                        return null;
                    }
                })
            );

            return createdStages.filter(s => s !== null);
        }

        return existingStages;
    } catch (error) {
        throw error;
    }
};

export default {
    validator: validator({
        body: Joi.object({
            stageType: Joi.string().valid('lead', 'deal').required(),
            stageName: Joi.string().required(),
            pipeline: Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { stageType, stageName, pipeline } = req.body;
            const existingStage = await Stage.findOne({ where: { stageName, pipeline } });
            if (existingStage) {
                return responseHandler.error(res, "Stage already exists");
            }
            const stage = await Stage.create({
                stageType,
                stageName,
                pipeline,
                client_id: req.des?.client_id,
                created_by: req.user.username
            });
            return responseHandler.success(res, "Stage created successfully", stage);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
