import Joi from "joi";
import Meeting from "../../models/meetingModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        const { id } = req.params;
        try {
            const meeting = await Meeting.findByPk(id);
            if (!meeting) {
                return responseHandler.notFound(res, "Meeting not found");
            }
            await meeting.destroy();
            return responseHandler.success(res, "Meeting deleted successfully", meeting);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}