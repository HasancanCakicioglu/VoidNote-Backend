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
        required: false,
        optional: { nullable: true }
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
    variables:{
        in: ['body'],
        custom: {
            options: (value) => {
                return typeof value === 'object';
            },
            errorMessage: 'Variables should be an object'
        },
        optional: { nullable: true },
        required:false
    }

};