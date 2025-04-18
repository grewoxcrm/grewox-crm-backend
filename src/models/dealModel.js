import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Deal = sequelize.define("Deal", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    dealTitle: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    value: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    pipeline: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stage: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('won', 'lost', 'pending'),
        allowNull: false,
        defaultValue: 'pending'
    },
    label: {
        type: DataTypes.ENUM('Hot', 'Warm', 'Cold'),
        allowNull: false,
        defaultValue: 'Cold'
    },
    closedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    source: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    company_name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    products: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    files: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    assigned_to: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    client_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_won: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null
    },
    company_id: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    contact_id: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    updated_by: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    }
});


Deal.beforeCreate(async (deal) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingDeal = await Deal.findOne({ where: { id: newId } });
        if (!existingDeal) {
            isUnique = true;
        }
    }
    deal.id = newId;
});

export default Deal;