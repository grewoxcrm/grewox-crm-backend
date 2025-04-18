    import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Training = sequelize.define('training', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    links: {
        type: DataTypes.JSON,
        allowNull: false
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

Training.beforeCreate(async (training) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingTraining = await Training.findOne({ where: { id: newId } });
        if (!existingTraining) {
            isUnique = true;
        }
    }
    training.id = newId;
});

export default Training;