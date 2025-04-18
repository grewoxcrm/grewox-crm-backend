import Joi from "joi";
import TaskCalendar from "../../models/taskcalendarModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        body: Joi.object({
            taskName: Joi.string().required(),
            taskDate: Joi.date().required(),
            taskTime: Joi.string().required(),
            taskDescription: Joi.string().required()

        }),
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { taskName, taskDate, taskTime, taskDescription } = req.body;
            const task = await TaskCalendar.findByPk(id);
            if (!task) {
                return responseHandler.error(res, "Task not found");
            }
            const existingTask = await TaskCalendar.findOne({ where: { taskName, taskDate, taskTime, taskDescription, id: { [Op.not]: id } } });
            if (existingTask) {
                return responseHandler.error(res, "Task already exists");
            }
            await task.update({ taskName, taskDate, taskTime, taskDescription, updated_by: req.user?.username });
            return responseHandler.success(res, "Task updated successfully", task);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}