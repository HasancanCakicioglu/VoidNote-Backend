export const errorHandler = (statusCode, message,validation) => {
  const error = new Error();
  error.statusCode = statusCode;
  error.message = message;
  error.validation = validation;
  return error;
};
