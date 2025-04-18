import Joi from "joi";
import Pipeline from "../../models/pipelineModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const pipeline = await Pipeline.findByPk(id);
            if (!pipeline) {
                return responseHandler.notFound(res, "Pipeline not found");
            }
            await pipeline.destroy();
            return responseHandler.success(res, 'Pipeline deleted successfully', pipeline);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}