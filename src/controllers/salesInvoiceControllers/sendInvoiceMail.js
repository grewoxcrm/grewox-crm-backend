import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { EMAIL_FROM, FRONTEND_URL } from "../../config/config.js";
import { getInvoiceEmailTemplate } from "../../utils/emailTemplates.js";
import Activity from "../../models/activityModel.js";
import puppeteer from "puppeteer";
import sgMail from '@sendgrid/mail';

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            invoice: Joi.object().required(),
            customer: Joi.object({
                name: Joi.string().required(),
                email: Joi.string().email().required(),
                contact: Joi.string().allow('', null),
                address: Joi.string().allow('', null)
            }).required(),
            htmlContent: Joi.string().required()
        })
    }),

    handler: async (req, res) => {
        try {
            const { invoice, customer, htmlContent } = req.body;
            const { id } = req.params;

            // Set SendGrid API key
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);

            // Generate PDF using puppeteer
            const browser = await puppeteer.launch({ 
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
            const page = await browser.newPage();
            
            // Set viewport for A4 size
            await page.setViewport({
                width: 794, // A4 width in pixels at 96 DPI
                height: 1123, // A4 height in pixels at 96 DPI
                deviceScaleFactor: 2
            });

            // Add custom styles for PDF
            const styleContent = `
                @page {
                    size: A4;
                    margin: 0;
                }
                body {
                    margin: 0;
                    padding: 20px;
                    font-family: 'Segoe UI', sans-serif;
                    background: white;
                }
                .invoice-container {
                    width: 100%;
                    min-height: 100%;
                    background: white;
                    padding: 30px;
                    box-sizing: border-box;
                }
                img {
                    max-width: 100%;
                    height: auto;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 8px;
                    border: 1px solid #ddd;
                }
                th {
                    background-color: #f8f9fa;
                }
            `;

            // Set the content directly with custom styles
            await page.setContent(`
                <html>
                    <head>
                        <style>${styleContent}</style>
                    </head>
                    <body>
                        ${htmlContent}
                    </body>
                </html>
            `, {
                waitUntil: ['domcontentloaded', 'networkidle0'],
                timeout: 30000
            });

            // Wait for any images to load
            await page.evaluate(async () => {
                const images = document.querySelectorAll('img');
                await Promise.all([...images].map(img => {
                    if (img.complete) return;
                    return new Promise((resolve, reject) => {
                        img.addEventListener('load', resolve);
                        img.addEventListener('error', resolve); // still resolve on error
                    });
                }));
            });

            // Generate PDF with proper settings
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                },
                preferCSSPageSize: true,
                displayHeaderFooter: false
            });

            await browser.close();

            // Get email template
            const emailTemplate = getInvoiceEmailTemplate(customer.name, invoice, `${FRONTEND_URL}/dashboard/sales/invoice/${invoice.salesInvoiceNumber}`);

            // Prepare email data
            const msg = {
                to: customer.email,
                from: {
                    email: EMAIL_FROM,
                    name: req.user?.username || 'Grewox CRM'
                },
                subject: `Invoice #${invoice.salesInvoiceNumber} from ${req.user?.username || 'Grewox CRM'}`,
                html: emailTemplate,
                attachments: [{
                    content: pdf.toString('base64'),
                    filename: `Invoice-${invoice.salesInvoiceNumber}.pdf`,
                    type: 'application/pdf',
                    disposition: 'attachment',
                    contentId: 'invoice-pdf'
                }]
            };

            // Send email
            await sgMail.send(msg);

            // Log activity
            await Activity.create({
                related_id: id,
                activity_from: "sales_invoice",
                activity_id: invoice.id,
                action: "email_sent",
                performed_by: req.user?.username,
                client_id: req.des?.client_id,
                activity_message: `Invoice #${invoice.salesInvoiceNumber} sent via email to ${customer.email}`
            });

            return responseHandler.success(res, "Invoice sent successfully via email");

        } catch (error) {
            console.error('Error sending invoice email:', error);
            return responseHandler.error(res, error?.message || "Failed to send invoice email");
        }
    }
};