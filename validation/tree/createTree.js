import mongoose from 'mongoose';

export const createTreeValidationSchema = {
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
};