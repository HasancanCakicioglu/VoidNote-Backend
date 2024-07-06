

export const getUserValidationSchema = {
  // Body doğrulama
  type: {
    in: ['body'],
    notEmpty: {
      errorMessage: 'Type is required',
    },
    isString: {
      errorMessage: 'Type must be a string',
    },
    custom: {
        options: (value) => {
          // Geçerli değerleri belirleyin
          const validTypes = ['all', 'notes', 'trees','todos','calendars']; // Sadece bu değerler kabul edilecek
          if (!validTypes.includes(value)) {
            throw new Error(`Invalid type. Valid values are: ${validTypes.join(', ')}`);
          }
          return true;
        },
      },
  },
};
