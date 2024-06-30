export const sendMailConstants = {
    subject: 'VoidNote Email Verification',
    emailTemplate: (verificationCode) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #4B0082; border-radius: 10px; background-color: #663399; color: #ffffff;">
            <h2 style="text-align: center; color: #4CAF50;">VoidNote</h2>
            <hr style="border: none; border-top: 1px solid #9C27B0;">
            <p style="font-size: 16px; color: #ffffff;">Hello,</p>
            <p style="font-size: 16px; color: #ffffff;">Thank you for signing up for VoidNote! Please use the following code to verify your email address:</p>
            <div style="text-align: center; margin: 20px 0;">
                <span style="display: inline-block; padding: 10px 20px; font-size: 20px; color: #ffffff; background-color: #4CAF50; border-radius: 5px;">${verificationCode}</span>
            </div>
            <p style="font-size: 16px; color: #ffffff;">If you did not request this email, please disregard this message.</p>
            <p style="font-size: 16px; color: #ffffff;">Best regards,</p>
            <p style="font-size: 16px; color: #ffffff;"><strong>The VoidNote Team</strong></p>
            <hr style="border: none; border-top: 1px solid #9C27B0;">
            <p style="font-size: 12px; color: #ffffff; text-align: center;">© 2024 VoidNote. All rights reserved.</p>
        </div>
    `,
    resetPasswordSubject: 'VoidNote Password Reset',
    resetPasswordTemplate: (verificationCode) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="text-align: center; color: #4CAF50;">VoidNote</h2>
            <hr style="border: none; border-top: 1px solid #eee;">
            <p style="font-size: 16px; color: #333;">Hello,</p>
            <p style="font-size: 16px; color: #333;">You recently requested to reset your password for VoidNote account. Please click the link below to reset your password:</p>
            <div style="text-align: center; margin: 20px 0;">
               <span style="display: inline-block; padding: 10px 20px; font-size: 20px; color: #ffffff; background-color: #4CAF50; border-radius: 5px;">${verificationCode}</span>
            </div>
            <p style="font-size: 16px; color: #333;">If you did not request a password reset, please disregard this email.</p>
            <p style="font-size: 16px; color: #333;">Best regards,</p>
            <p style="font-size: 16px; color: #333;"><strong>The VoidNote Team</strong></p>
            <hr style="border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #aaa; text-align: center;">© 2024 VoidNote. All rights reserved.</p>
        </div>
    `
};
