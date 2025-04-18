import { FRONTEND_URL } from '../config/config.js';

const getCommonEmailTemplate = (content) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Notification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            margin: 0;
            padding: 0;
            color: #2d3748;
        }
        .container {
            background-color: #ffffff;
            max-width: 600px;
            margin: 40px auto;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo img {
            height: 60px;
            width: auto;
        }
        h1 {
            text-align: center;
            color: #1a202c;
            font-size: 26px;
            margin-bottom: 20px;
        }
        p {
            margin: 14px 0;
            font-size: 16px;
            color: #4a5568;
        }
        .otp {
            font-size: 30px;
            font-weight: bold;
            text-align: center;
            background-color: #f0f4f8;
            color: #2b6cb0;
            padding: 16px;
            border-radius: 8px;
            letter-spacing: 4px;
            margin: 24px 0;
        }
        a {
            display: inline-block;
            background-color: #2b6cb0;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: background-color 0.3s ease;
        }
        a:hover {
            background-color: #2c5282;
        }
        ul {
            background-color: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        li {
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
            color: #4a5568;
        }
        li:last-child {
            border-bottom: none;
        }
        .footer {
            text-align: center;
            font-size: 13px;
            color: #a0aec0;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        .invoice-details {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #2b6cb0;
            text-align: center;
            margin: 20px 0;
        }
        .status-tag {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            text-transform: capitalize;
        }
        .status-unpaid {
            background-color: #fee2e2;
            color: #dc2626;
        }
        .status-paid {
            background-color: #dcfce7;
            color: #16a34a;
        }
        .status-partially_paid {
            background-color: #fef9c3;
            color: #ca8a04;
        }
        .buttons {
            text-align: center;
            margin: 30px 0;
        }
        .buttons a {
            margin: 0 10px;
        }
        .view-button {
            background-color: #4f46e5;
        }
        .pay-button {
            background-color: #16a34a;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="https://www.grewox.com/wp-content/uploads/2025/02/logo.png" alt="Grewox Infotech Logo">
        </div>
        ${content}
        <div class="footer">
            <p>Grewox CRM | All rights reserved</p>
        </div>
    </div>
</body>
</html>
`;
};

export const getWelcomeEmailTemplate = (username) => {
    const content = `
        <h1>Welcome to CRM</h1>
        <p>Dear ${username},</p>
        <p>Thank you for joining our CRM management platform.</p>
        <p style="text-align: center;">
            <a href="${FRONTEND_URL}/login">Get Started</a>
        </p>
    `;
    return getCommonEmailTemplate(content);
};

export const getPasswordResetEmailTemplate = (username, otp) => {
    const content = `
        <h1>Password Reset Request</h1>
        <p>Dear ${username},</p>
        <p>We received a request to reset your password. Here's your OTP:</p>
        <div class="otp">${otp}</div>
        <p style="text-align: center; color: #64748b;">This OTP will expire in 10 minutes.</p>
        <p style="text-align: center;">If you didn't request this, please ignore this email.</p>
    `;
    return getCommonEmailTemplate(content);
};

export const getVerificationEmailTemplate = (username, otp) => {
    const content = `
        <h1>Verify Your Email</h1>
        <p>Dear ${username},</p>
        <p>Welcome to CRM! Please verify your email with this OTP:</p>
        <div class="otp">${otp}</div>
        <p style="text-align: center; color: #64748b;">This OTP will expire in 5 minutes.</p>
    `;
    return getCommonEmailTemplate(content);
};

export const getPlanBuyEmailTemplate = (username, plan, billUrl) => {
    const content = `
        <h1>Plan Purchase Confirmation</h1>
        <p>Dear ${username},</p>
        <p>Congratulations! You have successfully purchased the "${plan.name}" plan.</p>
        <p>Plan details:</p>
        <ul>
            <li>Plan Name: ${plan.name}</li>
            <li>Duration: ${plan.duration}</li>
            <li>Trial Period: ${plan.trial_period}</li>
            <li>Price: ${plan.price}</li>
            <li>Users: ${plan.max_users}</li>
            <li>Clients: ${plan.max_clients}</li>
            <li>Storage: ${plan.storage_limit}</li>
        </ul>
        <p style="text-align: center;">
            <a href="${billUrl}">Download Invoice</a>
        </p>
    `;
    return getCommonEmailTemplate(content);
};

export const getInvoiceEmailTemplate = (customerName, invoice, viewUrl) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: invoice.currency || 'INR'
        }).format(amount);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'paid':
                return 'status-paid';
            case 'partially_paid':
                return 'status-partially_paid';
            default:
                return 'status-unpaid';
        }
    };

    const content = `
        <h1>Invoice from Grewox CRM</h1>
        <p>Dear ${customerName},</p>
        <p>Please find your invoice details below:</p>
        
        <div class="invoice-details">
            <ul>
                <li><strong>Invoice Number:</strong> ${invoice.salesInvoiceNumber}</li>
                <li><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</li>
                <li><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</li>
                <li>
                    <strong>Status:</strong> 
                    <span class="status-tag ${getStatusClass(invoice.payment_status)}">
                        ${invoice.payment_status}
                    </span>
                </li>
            </ul>
            
            <div class="amount">
                ${formatCurrency(invoice.total)}
            </div>
        </div>

        <div class="buttons">
            <a href="${viewUrl}" class="view-button">View Invoice</a>
            ${invoice.payment_status !== 'paid' ? `
                <a href="${invoice.upiLink}" class="pay-button">Pay Now</a>
            ` : ''}
        </div>

        ${invoice.additional_notes ? `
            <p><strong>Additional Notes:</strong></p>
            <p>${invoice.additional_notes}</p>
        ` : ''}

        <p>If you have any questions, please don't hesitate to contact us.</p>
    `;
    return getCommonEmailTemplate(content);
};
