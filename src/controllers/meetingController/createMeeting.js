import Joi from "joi";
import Meeting from "../../models/meetingModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Notification from "../../models/notificationModel.js";
import dayjs from "dayjs";

export default {
    validator: validator({
        body: Joi.object({
            department: Joi.string().required(),
            employee: Joi.any().optional(),
            title: Joi.string().required(),
            description: Joi.string().required(),
            date: Joi.date().required(),
            startTime: Joi.string().required(),
            endTime: Joi.string().optional().allow("",null),
            meetingLink: Joi.string().optional().allow("",null),
            client: Joi.string().optional().allow("",null),
            status: Joi.string().valid('scheduled', 'completed', 'cancelled').default('scheduled')
        })
    }),
    handler: async (req, res) => {
        try {
            const { title, date, startTime, endTime, description, meetingLink, status, client, department, employee } = req.body;

            console.log('Creating Meeting:', {
                title,
                date,
                startTime,
                endTime,
                department,
                employee
            });

            const existingMeeting = await Meeting.findOne({ 
                where: { 
                    title, 
                    date, 
                    startTime, 
                    endTime, 
                    description, 
                    meetingLink, 
                    status, 
                    department, 
                    employee 
                } 
            });

            if (existingMeeting) {
                return responseHandler.error(res, "Meeting already exists");
            }

            const meeting = await Meeting.create({
                title,
                description,
                date,
                startTime,
                endTime,
                meetingLink,
                status,
                department,
                employee,
                client,
                client_id: req.des?.client_id,
                created_by: req.user?.username
            });

            // Calculate reminder time (2 minutes before)
            const [hours, minutes] = startTime.split(':').map(Number);
            let reminderHours = hours;
            let reminderMinutes = minutes - 2;

            // Handle minute rollover
            if (reminderMinutes < 0) {
                reminderHours = hours - 1;
                reminderMinutes = 58; // 60 - 2
                
                // Handle hour rollover
                if (reminderHours < 0) {
                    reminderHours = 23;
                }
            }

            // Format reminder time with padding
            const reminderTime = `${String(reminderHours).padStart(2, '0')}:${String(reminderMinutes).padStart(2, '0')}:00`;

            console.log('Time Calculations:', {
                originalTime: startTime,
                reminderTime: reminderTime
            });

            // 1. Create meeting assignment notification
            await Notification.create({
                related_id: meeting.id,
                users: employee,
                title: "New Meeting",
                from: req.user?.id,
                client_id: req.des?.client_id,
                message: `${req.user?.username} assigned you a meeting: ${title}`,
                description: `📅 Meeting Details:
• Title: ${title}
• Date: ${dayjs(date).format('YYYY-MM-DD')}
• Start Time: ${startTime}
${endTime ? `• End Time: ${endTime}` : ''}
${meetingLink ? `• Meeting Link: ${meetingLink}` : ''}
• Department: ${department}
• Status: ${status}
${description ? `\nDescription: ${description}` : ''}`,
                created_by: req.user?.username,
            });

            // 2. Create notification for meeting start time
            await Notification.create({
                related_id: meeting.id,
                users: employee,
                title: "Meeting Starting",
                notification_type: "reminder",
                from: req.user?.id,
                client_id: req.des?.client_id,
                date: dayjs(date).format('YYYY-MM-DD'),
                time: startTime,
                message: `Meeting starting: ${title}`,
                description: `📅 Meeting Details:
• Title: ${title}
• Start Time: ${startTime}
${endTime ? `• End Time: ${endTime}` : ''}
${meetingLink ? `• Meeting Link: ${meetingLink}` : ''}
• Department: ${department}
${description ? `\nDescription: ${description}` : ''}`,
                created_by: req.user?.username
            });

            // 3. Create reminder notification (2 minutes before)
            await Notification.create({
                related_id: meeting.id,
                users: employee,
                title: "Meeting Starting Soon",
                notification_type: "reminder",
                from: req.user?.id,
                client_id: req.des?.client_id,
                date: dayjs(date).format('YYYY-MM-DD'),
                time: reminderTime,
                message: `Meeting starting in 2 minutes: ${title}`,
                description: `⏰ Upcoming Meeting:
• Title: ${title}
• Starts in: 2 minutes
• Start Time: ${startTime}
${endTime ? `• End Time: ${endTime}` : ''}
${meetingLink ? `• Meeting Link: ${meetingLink}` : ''}
• Department: ${department}
${description ? `\nDescription: ${description}` : ''}`,
                created_by: req.user?.username
            });

            console.log('Meeting Notifications Created:', {
                title,
                date: dayjs(date).format('YYYY-MM-DD'),
                startTime,
                reminderTime,
                notificationCount: 3
            });

            return responseHandler.success(res, "Meeting created successfully", meeting);
        } catch (error) {
            console.error('Meeting Creation Error:', error);
            return responseHandler.error(res, error?.message);
        }
    }
}
