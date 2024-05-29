export const createNoteValidationSchema = {
    title: {
        in: ['body'],
        isString: true,
        isLength: {
            errorMessage: 'Title should be at least 1 chars long',
            options: { min: 1 , max:50},
        },
    },
    content: {
        in: ['body'],
        isString: true,
    },
    styleModel: {
        in: ['body'],
        isObject: true,
        required:false,
        optional: { nullable: true }
    },
};