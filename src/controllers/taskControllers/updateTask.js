import Joi from "joi";
import Task from "../../models/taskModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Notification from "../../models/notificationModel.js";
import isSameDay from "../../utils/isSameDay.js";
import { Op } from "sequelize";
import { s3 } from "../../config/config.js";
import uploadToS3 from "../../utils/uploadToS3.js";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().optional(),
    }),
    body: Joi.object({
      taskName: Joi.string().optional(),
      task_reporter: Joi.string().optional(),
      startDate: Joi.date().optional(),
      dueDate: Joi.date().optional(),
      assignTo: Joi.object().optional(),
      description: Joi.string().optional(),
      priority: Joi.string().optional(),
      status: Joi.string().optional(),
      reminder_date: Joi.date().allow("", null),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;

      const {
        taskName,
        task_reporter,
        startDate,
        dueDate,
        assignTo,
        priority,
        status,
        description,
        reminder_date,
      } = req.body;

      const task = await Task.findByPk(id);
      if (!task) {
        return responseHandler.error(res, "Task not found");
      }

      const existingTask = await Task.findOne({
        where: { taskName, id: { [Op.not]: id } },
      });
      if (existingTask) {
        return responseHandler.error(res, "Task already exists");
      }

      let fileUrl = task.file;
      if (file) {
        // Delete existing file from S3 if it exists
        if (task.file) {
          const key = decodeURIComponent(task.file.split(".com/").pop());
          const s3Params = {
            Bucket: s3.config.bucketName,
            Key: key,
          };
          await s3.deleteObject(s3Params).promise();
        }
        fileUrl = await uploadToS3(file, "client", "task_files", req.user?.username);
      }

      const updatedTask = await task.update({
        taskName,
        task_reporter,
        startDate,
        dueDate,
        assignTo,
        priority,
        status,
        description,
        reminder_date,
        file: fileUrl,
        updated_by: req.user?.username,
      });

      if (reminder_date) {
        const reminderDate = new Date(reminder_date);
        const today = new Date();
        if (isSameDay(reminderDate, today)) {
          const dueDateDiff = Math.ceil(
            (new Date(dueDate) - reminderDate) / (1000 * 60 * 60 * 24)
          );
          await Notification.create({
            related_id: id,
            users: assignTo,
            title: "Task Reminder",
            notification_type: "reminder",
            from: req.user?.id,
            message: `Task due: ${dueDateDiff} days. Don't forget: ${taskName}`,
          });
        }
      }

      return responseHandler.success(
        res,
        "Task updated successfully",
        updatedTask
      );
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
