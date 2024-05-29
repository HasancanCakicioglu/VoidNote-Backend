
export const deleteUserValidationSchema = {
      id: {
          in: ['params'],
          isMongoId: true,
          errorMessage: 'Params Invalid MongoDB Id',
      },

};