import Joi from "joi";
import validator from "../../utils/validator.js";
import Meeting from "../../models/meetingModel.js";
import responseHandler from "../../utils/responseHandler.js";
import { Op } from "sequelize";


export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            department: Joi.string().optional(),
            employee: Joi.any().optional(),
            title: Joi.string().optional(),
            date: Joi.date().optional(),
            startTime: Joi.string().optional(),
            endTime: Joi.string().optional(),
            description: Joi.string().optional(),
            meetingLink: Joi.string().optional(),
            client: Joi.string().optional().allow("",null),
            status: Joi.string().optional()
        })
    }),
    handler: async (req, res) => {
        const { id } = req.params;
        const { title, date, startTime, endTime, description, meetingLink, status, department,client, employee } = req.body;
        try {
            const meeting = await Meeting.findByPk(id);
            if (!meeting) {
                return responseHandler.notFound(res, "Meeting not found");
            }
            const existingMeeting = await Meeting.findOne({ where: { title, date, startTime, endTime, description, meetingLink, status,client, department, employee, id: { [Op.not]: id } } });
            if (existingMeeting) {
                return responseHandler.error(res, "Meeting already exists");
            }
            await meeting.update({ title, date, startTime, endTime, description, meetingLink, status,client, department, employee });
            return responseHandler.success(res, "Meeting updated successfully", meeting);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}