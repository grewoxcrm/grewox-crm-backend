import Joi from "joi";
import Setting from "../../models/settingModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import uploadToS3 from "../../utils/uploadToS3.js";

export default {
    validator: validator({
        body: Joi.object({
            termsandconditions: Joi.string().optional(),
            companyName: Joi.string().required(),
            title: Joi.string().required(),
            merchant_name: Joi.string().optional(),
            merchant_upi_id: Joi.string().optional(),
        })
    }),
    handler: async (req, res) => {
        try {
            const { termsandconditions, companyName, title, merchant_name, merchant_upi_id } = req.body;

            const logo = req.files?.companylogo?.[0];
            const favicon = req.files?.favicon?.[0];

            if (!logo) {
                return responseHandler.error(res, "Company logo is required");
            }
            if (!favicon) {
                return responseHandler.error(res, "Favicon is required");
            }


            // Upload logo to S3
            const logoUrl = await uploadToS3(logo, "client", "company-logos", req.user?.username);
            const faviconUrl = await uploadToS3(favicon, "client", "company-logos", req.user?.username);

            const setting = await Setting.create({
                companylogo: logoUrl,
                favicon: faviconUrl,
                companyName,
                title,
                termsandconditions,
                client_id: req.des?.client_id,
                created_by: req.user?.username,
                merchant_name,
                merchant_upi_id
            });

            return responseHandler.success(res, "Setting created successfully", setting);
        } catch (error) {
            console.log(error);
            return responseHandler.error(res, error?.message);
        }
    }
}   