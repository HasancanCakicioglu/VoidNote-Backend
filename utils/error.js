export const errorHandler = (statusCode, message,validation,data) => {
  const error = new Error();
  error.statusCode = statusCode;
  error.message = message;
  error.validation = validation;
  error.data = data;
  return error;
};
