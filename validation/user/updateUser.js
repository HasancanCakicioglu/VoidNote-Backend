import mongoose from "mongoose";

export const updateUserValidationSchema = {
      password: {
          in: ['body'],
          isString: true,
          optional:true,
          isLength: {
              errorMessage: 'Password should be at least 6 chars long',
              options: { min: 6, max: 50 },
          },
      },
        username: {
            in: ['body'],
            isString: true,
            optional:true,
            isLength: {
                errorMessage: 'Username should be at least 3 chars long',
                options: { min: 3, max: 50 },
            },
        },
        email: {
            in: ['body'],
            optional:true,
            isEmail: true,
        },
        profilePhotoUrl: {
            in: ['body'],
            optional:true,
            isString: true,
        },
        id: {
            in: ['params'],
            custom: {
                options: (value) => {
                    return mongoose.Types.ObjectId.isValid(value);
                },
                errorMessage: 'ID must be a valid ObjectId'
            }
        },
        preferences: {
            in: ['body'],
            optional:true,
            isObject: true,
        },
        notes: {
            in: ['body'],
            optional:true,
            isArray: true,
        },
        treeNotes: {
            in: ['body'],
            optional:true,
            isArray: true,
        },
        todos: {
            in: ['body'],
            optional:true,
            isArray: true,
        },
        calendar: {
            in: ['body'],
            optional:true,
            isArray: true,
        },

  };