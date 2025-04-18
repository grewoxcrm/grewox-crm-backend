import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Announcement from "../../models/announcementModel.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        const { id } = req.params;
        try {
            const announcement = await Announcement.findByPk(id);
            if (!announcement) {
                return responseHandler.error(res, "Announcement not found");
            }
            await announcement.destroy();
            return responseHandler.success(res, "Announcement deleted successfully", announcement);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}   