import mongoose from 'mongoose';

export const createSubTodoValidationSchema = {
    id: {
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
        errorMessage: 'Content must be a string'
    },
    priority: {
        in: ['body'],
        isNumeric: true,
        errorMessage: 'Priority must be a number'
    },
    completed: {
        in: ['body'],
        isBoolean: true,
        errorMessage: 'Completed must be a boolean'
    }
};