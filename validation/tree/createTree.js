import mongoose from 'mongoose';

export const createTreeValidationSchema = {
    title: {
        in: ['body'],
        isString: true,
        isLength: {
            errorMessage: 'Title should be at least 1 chars long',
            options: { min: 1 , max:50},
        },
    },
    parentID: {
        in: ['body'],
        optional: { nullable: true },
        required: false,
        custom: {
            options: (value) => {
                return mongoose.Types.ObjectId.isValid(value);
            },
            errorMessage: 'ID must be a valid ObjectId'
        }
    },
    order: {
        in: ['body'],
        isInt: true
    },
};