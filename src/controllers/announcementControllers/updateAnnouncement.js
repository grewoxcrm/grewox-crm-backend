import Announcement from "../../models/announcementModel.js";
import responseHandler from "../../utils/responseHandler.js";
import Joi from "joi";
import validator from "../../utils/validator.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required(),
            branch: Joi.object({
                branch: Joi.array().items(Joi.string())
            }).optional().allow('', null),
        })
    }),
    handler: async (req, res) => {
        const { title, description, branch } = req.body;
        const { id } = req.params;
        try {
            const announcement = await Announcement.findByPk(id);
            if (!announcement) {
                return responseHandler.error(res, "Announcement not found");
            }
            await announcement.update({ title, description, branch, updated_by: req.user?.username });
            return responseHandler.success(res, "Announcement updated successfully", announcement);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
