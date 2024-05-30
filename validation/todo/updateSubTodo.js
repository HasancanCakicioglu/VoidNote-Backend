import mongoose from "mongoose";

export const updateSubTodoValidationSchema = {
    todoId: {
        in: ['params'],
        custom: {
            options: (value) => {
                return mongoose.Types.ObjectId.isValid(value);
            },
            errorMessage: 'ID must be a valid ObjectId'
        }
    },
    subTodoId: {
        in: ['params'],
        custom: {
            options: (value) => {
                return mongoose.Types.ObjectId.isValid(value);
            },
            errorMessage: 'ID must be a valid ObjectId'
        }
    },

    content: {
        in: ['body'],
        isString: true,
        required:false,
        optional: { nullable: true }
    },
    completed: {
        in: ['body'],
        isBoolean: true,
        required:false,
        optional: { nullable: true }
    },
    priority: {
        in: ['body'],
        isInt: {
            options: { min: 1, max: 3 },
            errorMessage: 'Priority should be between 1 and 3'
        },
        required:false,
        optional: { nullable: true }
    },
    styleModel: {
        in: ['body'],
        isObject: true,
        required:false,
        optional: { nullable: true }
    },
};