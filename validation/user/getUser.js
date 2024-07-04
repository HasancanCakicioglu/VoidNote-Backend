export const getUserValidationSchema = [
    // Header doğrulama
    header('Authorization')
      .notEmpty()
      .withMessage('Authorization header is required')
      .custom((value) => {
        // Bearer token'in formatını kontrol et
        if (!value.startsWith('Bearer ')) {
          throw new Error('Invalid Bearer token format');
        }
        // Token'i al, Bearer kısmını kaldır
        const token = value.split(' ')[1];
        // Token'in valid bir MongoDB ObjectId olup olmadığını kontrol et
        if (!mongoose.isValidObjectId(token)) {
          throw new Error('Invalid MongoDB ObjectId');
        }
        return true;
      }),
    
    body('type')
      .notEmpty()
      .withMessage('Type is required')
      .isString()
      .withMessage('Type must be a string'),
  ];