import mongoose from "mongoose";


export const updateSubCalenderValidationSchema = {
    id: {
        in: ['params'],
        custom: {
            options: (value) => {
                return mongoose.Types.ObjectId.isValid(value);
            },
            errorMessage: 'ID must be a valid ObjectId'
        }
    },
    subId: {
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
        optional: { nullable: true },
        required:false
    },
    date: {
        in: ['body'],
        isDate: true,
        optional: { nullable: true },
        required:false
    },
    content: {
        in: ['body'],
        isString: true,
        optional: { nullable: true },
        required:false
    },

};