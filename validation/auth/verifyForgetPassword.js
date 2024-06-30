
export const verifyForgetPasswordValidationSchema = {
    email: {
        in: ['body'],
        isEmail: true,
    },
    password: {
        in: ['body'],
        isString: true,
        isLength: {
            errorMessage: 'Password should be at least 6 chars long',
            options: { min: 6, max: 50 },
        },
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