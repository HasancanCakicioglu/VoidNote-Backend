
export const googleValidationSchema = {
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
    photo: {
        in: ['body'],
        isString: true,
    },

};