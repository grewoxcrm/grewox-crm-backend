import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';

const CustomForm = sequelize.define('custom_form', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
        defaultValue: () => generateId()
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    event_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    event_location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    fields: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    client_id: {
        type: DataTypes.STRING,
        allowNull: false
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

CustomForm.beforeCreate(async (customForm) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingCustomForm = await CustomForm.findOne({
            where: { id: newId }
        });
        if (!existingCustomForm) {
            isUnique = true;
        }
    }
    customForm.id = newId;
});

export default CustomForm;
