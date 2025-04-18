import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from '../middlewares/generatorId.js';


const Estimate = sequelize.define('estimate', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: () => generateId(),
    },
    estimateNumber: {
        type: DataTypes.STRING,
        unique: true,
    },
    related_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    valid_till: {
        type: DataTypes.DATE,
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    project: {
        type: DataTypes.STRING,
        allowNull: false
    },
    client: {
        type: DataTypes.STRING,
        allowNull: false                                                            
    },
    calculatedTax: {
        type: DataTypes.INTEGER,
        allowNull: true,   
        defaultValue: null
    },
    items: {    
        type: DataTypes.JSON,
        allowNull: false
    },
    discount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    tax: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    total: {
        type: DataTypes.INTEGER,
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


Estimate.beforeCreate(async (estimate) => {
    // Generate unique ID
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingEstimate = await Estimate.findOne({ where: { id: newId } });
        if (!existingEstimate) {
            isUnique = true;
        }
    }
    estimate.id = newId;

    // Get all estimate numbers and find the highest one
    const allEstimates = await Estimate.findAll({
        attributes: ['estimateNumber'],
        raw: true
    });

    let highestNumber = 0;
    allEstimates.forEach(estimate => {
        if (estimate.estimateNumber) {
            const numberPart = parseInt(estimate.estimateNumber.replace('EST#', ''));
            if (!isNaN(numberPart) && numberPart > highestNumber) {
                highestNumber = numberPart;
            }
        }
    });

    // Next number should be highest + 1
    const nextNumber = highestNumber + 1;
    estimate.estimateNumber = `EST#${nextNumber}`;
});

export default Estimate;