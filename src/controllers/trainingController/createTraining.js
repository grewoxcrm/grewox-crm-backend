import Joi from "joi";
import Training from "../../models/trainingModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            title:Joi.string().required(),
            category: Joi.string().required(),
            links: Joi.object().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { category, links,title } = req.body
            const existingTraining = await Training.findOne({ where: { category } });
            if (existingTraining) {
                return responseHandler.error(res, "Training already exists");
            }
            const training = await Training.create({
                category,
                title,
                links,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            })
            return responseHandler.success(res, "Training created successfully", training)
        } catch (error) {
            return responseHandler.error(res, error.message)
        }
    }
}
