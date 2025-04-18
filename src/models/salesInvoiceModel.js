import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const SalesInvoice = sequelize.define("sales_Invoice", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId(),
    },
    salesInvoiceNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        defaultValue: "S-INV-#1"
    },
    related_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    customer: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    issueDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    upiLink: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    items: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        get() {
            const rawValue = this.getDataValue('items');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('items', JSON.stringify(value));
        }
    },
    payment_status: {
        type: DataTypes.ENUM('paid', 'unpaid', 'partially_paid'),
        allowNull: false,
        defaultValue: 'unpaid'
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subtotal: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    tax: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    discount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0  
        }
    },
    cost_of_goods: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    profit: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    profit_percentage: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    additional_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    client_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    updated_by: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    }
});

// Add hook to automatically generate unique ID and invoice number
SalesInvoice.beforeCreate(async (salesInvoice) => {
    try {
        // Generate unique ID
        let isUnique = false;
        let newId;
        while (!isUnique) {
            newId = generateId();
            const existingSalesInvoice = await SalesInvoice.findOne({
                where: { id: newId },
            });
            if (!existingSalesInvoice) {
                isUnique = true;
            }
        }
        salesInvoice.id = newId;

        // Generate invoice number
        const lastInvoice = await SalesInvoice.findOne({
            where: { client_id: salesInvoice.client_id },
            order: [['createdAt', 'DESC']],
        });

        let nextNumber = 1;
        if (lastInvoice && lastInvoice.salesInvoiceNumber) {
            // Extract number from last invoice number (S-INV-#X)
            const match = lastInvoice.salesInvoiceNumber.match(/#(\d+)$/);
            if (match && match[1]) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        // Set the new invoice number
        salesInvoice.setDataValue('salesInvoiceNumber', `S-INV-#${nextNumber}`);
    } catch (error) {
        console.error('Error in beforeCreate hook:', error);
        throw error;
    }
});

// Add hook to validate total amount
SalesInvoice.beforeSave(async (salesInvoice) => {
    // Verify total matches calculations
    const calculatedTotal = salesInvoice.subtotal + salesInvoice.tax - salesInvoice.discount;
    if (Math.abs(calculatedTotal - salesInvoice.total) > 0.01) { // Allow small floating point differences
        throw new Error('Invoice total does not match calculations');
    }

    // Verify profit calculations
    const calculatedProfit = salesInvoice.total - salesInvoice.cost_of_goods;
    if (Math.abs(calculatedProfit - salesInvoice.profit) > 0.01) {
        throw new Error('Invoice profit does not match calculations');
    }

    // Calculate profit percentage
    if (salesInvoice.cost_of_goods > 0) {
        const calculatedPercentage = (salesInvoice.profit / salesInvoice.cost_of_goods) * 100;
        salesInvoice.profit_percentage = parseFloat(calculatedPercentage.toFixed(2));
    } else {
        salesInvoice.profit_percentage = 0;
    }
});

export default SalesInvoice;
