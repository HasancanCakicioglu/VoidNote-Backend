import mongoose from 'mongoose';

export const updateNoteValidationSchema = {
    id: {
        in: ['params'],
        custom: {
            options: (value) => {
                return mongoose.Types.ObjectId.isValid(value);
            },
            errorMessage: 'ID must be a valid ObjectId'
        }
    },
    title: {
        in: ['body'],
        isString: true,
        required: false,
        optional: { nullable: true }
    },
    content: {
        in: ['body'],
        isString: true,
        required: false,
        optional: { nullable: true }
    },
    brief: {
        in: ['body'],
        isString: true,
        required: false,
        optional: { nullable: true ,max:50}
    },
    variables: {
        in: ['body'],
        optional: { nullable: true },
        required: false
    }
};