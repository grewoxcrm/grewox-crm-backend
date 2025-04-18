import Joi from "joi";
import validator from "../../utils/validator.js";
import FormSubmission from "../../models/formSubmissionModel.js";
import CustomForm from "../../models/customFormModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            formId: Joi.string().required()
        }),
        body: Joi.object({
            submission_data: Joi.object().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { formId } = req.params;
            const { submission_data } = req.body;

            // Check if form exists and is still active
            const form = await CustomForm.findOne({
                where: { id: formId }
            });

            if (!form) {
                return responseHandler.error(res, "Form not found", 404);
            }

            // Check if form has expired
            const currentDate = new Date();
            const endDate = new Date(form.end_date);

            if (currentDate > endDate) {
                return responseHandler.error(res, "Form has expired", 400);
            }

            // Validate required fields from form schema
            const formFields = typeof form.fields === 'string'
                ? JSON.parse(form.fields)
                : form.fields;

            for (const [fieldName, fieldConfig] of Object.entries(formFields)) {
                if (fieldConfig.required && !submission_data[fieldName]) {
                    return responseHandler.error(res, `Field '${fieldName}' is required`, 400);
                }
            }

            // Create form submission
            const submission = await FormSubmission.create({
                form_id: formId,
                submission_data,
                client_id: form.client_id,
                created_by: req.user?.username || 'Public User'
            });

            return responseHandler.success(res, "Form submitted successfully", submission);
        } catch (error) {
            console.error('Form submission error:', error);
            return responseHandler.error(res, error?.message || "Error submitting form");
        }
    }
};
