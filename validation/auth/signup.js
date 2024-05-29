
export const signUpValidationSchema = {
    username: {
        in: ['body'],
        isString: true,
        isLength: {
            errorMessage: 'Username should be at least 3 chars long',
            options: { min: 3 , max:50},
        },
    },
    email: {
        in: ['body'],
        isEmail: true,
    },
    password: {
        in: ['body'],
        isString: true,
        isLength: {
            errorMessage: 'Password should be at least 6 chars long',
            options: { min: 6 , max:50},
        },
    },

};