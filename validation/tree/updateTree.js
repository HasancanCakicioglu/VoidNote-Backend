import mongoose from 'mongoose';

export const updateTreeValidationSchema = {
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
        required:false,
        optional: { nullable: true },
        isLength: {
            errorMessage: 'Title should be at least 1 chars long',
            options: { min: 1 , max:50},
        },
    },
    content: {
        in: ['body'],
        isString: true,
        required:false,
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