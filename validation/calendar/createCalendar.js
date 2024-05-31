
export const createCalenderValidationSchema = {
    title: {
        in: ['body'],
        isString: true,
        isLength: {
            errorMessage: 'Title should be at least 1 chars long',
            options: { min: 1 , max:50},
        },
    },
};