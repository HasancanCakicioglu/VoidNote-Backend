
export const verifyEmailValidationSchema = {
    email: {
        in: ['body'],
        isEmail: true,
    },
    verificationCode: {
        in: ['body'],
        isString: true,
        isLength: {
            errorMessage: 'verificationCode should be 6 chars long',
            options: { min: 6, max: 6 },
        },
    },

};