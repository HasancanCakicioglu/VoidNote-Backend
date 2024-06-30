
export const forgetPasswordValidationSchema = {
    email: {
        in: ['body'],
        isEmail: true,
    },

};