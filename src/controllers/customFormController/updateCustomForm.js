import Joi from "joi";
import validator from "../../utils/validator.js";
import CustomForm from "../../models/customFormModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required(),
            event_name: Joi.string().required(),
            event_location: Joi.string().required(),
            start_date: Joi.date().required(),
            end_date: Joi.date().min(Joi.ref('start_date')).required()
                .messages({
                    'date.min': 'End date must be later than start date'
                }),
            fields: Joi.object().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                title,
                description,
                event_name,
                event_location,
                start_date,
                end_date,
                fields
            } = req.body;

            const customForm = await CustomForm.findByPk(id);

            if (!customForm) {
                return responseHandler.error(res, "Custom form not found");
            }

            await customForm.update({
                title,
                description,
                event_name,
                event_location,
                start_date,
                end_date,
                fields,
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Custom form updated successfully", customForm);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
