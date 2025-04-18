import Joi from "joi";
import Contact from "../../models/contactModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import { Op } from "sequelize";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required(),
        }),
        body: Joi.object({
            contact_owner: Joi.string().required(),
            first_name: Joi.string().required(),
            last_name: Joi.string().allow('', null),
            company_name: Joi.string().required(),
            email: Joi.string().email().required(),
            phone: Joi.string().required(),
            contact_source: Joi.string().allow('', null),
            description: Joi.string().allow('', null),
            address: Joi.string().allow('', null),
            city: Joi.string().allow('', null),
            state: Joi.string().allow('', null),
            country: Joi.string().allow('', null),
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { contact_owner, first_name, last_name, company_name, email, phone, contact_source, description, address, city, state, country } = req.body;
            const contact = await Contact.findByPk(id);
            if (!contact) {
                return responseHandler.error(res, "Contact not found");
            }

            const existingContact = await Contact.findOne({ where: { email, id: { [Op.not]: id } } });
            if (existingContact) {
                return responseHandler.error(res, "Contact already exists");
            }

            await contact.update({ contact_owner, first_name, last_name, company_name, email, phone, contact_source, description, address, city, state, country, updated_by: req.user?.username });
                return responseHandler.success(res, "Contact updated successfully", contact);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
