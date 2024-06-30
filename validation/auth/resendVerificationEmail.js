
export const resendVerificationEmailValidationSchema = {
    email: {
        in: ['body'],
        isEmail: true,
    },

};