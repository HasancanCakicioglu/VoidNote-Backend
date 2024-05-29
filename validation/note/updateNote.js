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
        isLength: {
            errorMessage: 'Title should be at least 1 chars long',
            options: { min: 1 , max:50},
        },
        required: false,
        optional: { nullable: true }
    },
    content: {
        in: ['body'],
        isString: true,
        required: false,
        optional: { nullable: true }
    },
    styleModel: {
        in: ['body'],
        isObject: true,
        required:false,
        optional: { nullable: true }
    },
};