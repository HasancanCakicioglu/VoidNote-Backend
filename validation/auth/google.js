

export const googleValidationSchema  = {
    authorization: {
        in: ['headers'],
        exists: {
            errorMessage: 'Authorization header is required',
        },
        matches: {
            options: /^Bearer\s[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/,
            errorMessage: 'Authorization header must be in the format: Bearer <token>',
        },
    },
};