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
    content: {
        in: ['body'],
        isString: true,
        required:false,
        optional: { nullable: true }
    },
    styleModel: {
        in: ['body'],
        isObject: true,
        required:false,
        optional: { nullable: true }
    },
    children: {
        in: ['body'],
        isArray: true,
        required:false,
        optional: { nullable: true }
    },
    order: {
        in: ['body'],
        isInt: true,
        required:false,
        optional: { nullable: true }
    },
};