import Joi from "joi";
import Training from "../../models/trainingModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            category: Joi.string().required(),
            links: Joi.object().required(),
            title:Joi.string().required(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params
            const { category, links ,title} = req.body
            const existingTraining = await Training.findOne({ where: { category, id: { [Op.not]: id } } });
            if (existingTraining) {
                return responseHandler.error(res, "Training already exists");
            }
            const training = await Training.findByPk(id)
            await training.update({
                category,
                links,
                title,
                updated_by: req.user?.username
            })
            return responseHandler.success(res, "Training created successfully", training)
        } catch (error) {
            return responseHandler.error(res, error.message)
        }
    }
}
