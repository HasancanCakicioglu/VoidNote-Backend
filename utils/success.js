// backend/src/utils/responseHelper.js

export const sendSuccessResponse = (statusCode = 200, message = 'Request was successful',data= []) => {
    return {
      success: true,
      status: statusCode || 200,
      message:message || 'Request was successful',
      data:data || [],
    };
  };
  
