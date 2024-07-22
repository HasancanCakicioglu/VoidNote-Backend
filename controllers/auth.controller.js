import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import { sendSuccessResponse } from '../utils/success.js';
import jwt from 'jsonwebtoken';
import { validationResult, matchedData } from 'express-validator';
import { transporter } from "../config/nodemailer.js"
import oAuth2Client from '../config/oauth.js';
import { sendMailConstants } from '../constant/sendMail.js';



export const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errorHandler(400, 'Validation failed', errors.array()));
  }
  const { username, email, password } = matchedData(req);
  try {

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.verified) {
      return next(errorHandler(400, 'User already exists'));
    }

    if (existingUser && !existingUser.verified && existingUser.verificationCodeExpires > Date.now()) {
      return next(errorHandler(208, 'Verification email already sent'));
    }

    if (existingUser && !existingUser.verified) {
      await User.findByIdAndDelete(existingUser._id);
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const verificationCode = Math.random().toString(36).slice(-6);
    const verificationCodeExpires = new Date(Date.now() + 300000); // 5 minutes


    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: sendMailConstants.subject,
      html: sendMailConstants.emailTemplate(verificationCode)
    });

    const newUser = new User({ username, email, password: hashedPassword, verificationCode: verificationCode, verificationCodeExpires: verificationCodeExpires });
    await newUser.save();

    return res.status(201).json(sendSuccessResponse(201, "Verification email successfuly sent", []));
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errorHandler(400, 'Validation failed', errors.array()));
  }
  const { email, verificationCode } = matchedData(req);
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    if (user.verified) {
      return next(errorHandler(400, 'Email already verified'));
    }

    if (user.verificationCode !== verificationCode || new Date() > user.verificationCodeExpires) {
      return next(errorHandler(400, 'Invalid or expired verification code'));
    }

    user.verified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();


    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    const { password: hashedPassword, ...rest } = user._doc;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);



    return res.cookie('access_token', token, { httpOnly: true, expires: expiryDate })
    .status(200).json(sendSuccessResponse(200, "Email verified successfully", rest));
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errorHandler(400, 'Validation failed', errors.array()));
  }
  const { email } = matchedData(req);

  try {
    const user = await User
      .findOne({ email });

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    if (user.verified) {
      return next(errorHandler(400, 'Email already verified'));
    }

    if (user.verificationCode && new Date() < user.verificationCodeExpires) {
      return next(errorHandler(400, 'Verification code already sent'));
    }

    const verificationCode = Math.random().toString(36).slice(-6);
    const verificationCodeExpires = new Date(Date.now() + 300000); // 5 minutes

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: sendMailConstants.subject,
      html: sendMailConstants.emailTemplate(verificationCode)
    });

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    res.status(200).json({ message: 'Verification email sent successfully' });

  } catch (error) {

    next(error);
  }

}

export const forgetPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errorHandler(400, 'Validation failed', errors.array()));
  }

  const { email } = matchedData(req);

  try {
    const user = await User
      .findOne
      ({
        email
      });

    if (!user || user.authMethod === 'google') {
      return next(errorHandler(404, 'User not found'));
    }

    const resetPasswordToken = Math.random().toString(36).slice(-6);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: sendMailConstants.resetPasswordSubject,
      html: sendMailConstants.resetPasswordTemplate(resetPasswordToken)
    });

    user.passwordResetCode = resetPasswordToken;
    user.passwordResetCodeExpires = new Date(Date.now() + 300000); // 5 minutes
    await user.save();

    res.status(200).json({ message: 'Reset password email sent successfully' });

  } catch (error) {
    next(error);
  }

}

export const verifyForgetPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errorHandler(400, 'Validation failed', errors.array()));
  }
  const { email, password, verificationCode } = matchedData(req);
  try {
    const user = await User.findOne({ email });

    if (!user || user.authMethod === 'google') {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.passwordResetCode !== verificationCode || new Date() > user.passwordResetCodeExpires) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.password = bcryptjs.hashSync(password, 10);
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password change successfully' });
  } catch (error) {
    next(error);
  }
};



export const signin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    return next(errorHandler(400, 'Validation failed', errors.array()));

  }

  const { email, password } = matchedData(req);

  try {
    const validUser = await User.findOne({ email });

    if (!validUser) return next(errorHandler(404, 'User not found'));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'wrong credentials'));

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: hashedPassword, ...rest } = validUser._doc;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    res
      .cookie('access_token', token, { httpOnly: true, expires: expiryDate })
      .status(200)
      .json(sendSuccessResponse(200, "Login successful", rest));
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errorHandler(400, 'Validation failed', errors.array()));
  }

  try {
    const authorizationHeader = req.headers.authorization;

    const accessToken = authorizationHeader.split(' ')[1];
  
    const tokenInfo = await oAuth2Client.verifyIdToken({
      idToken: accessToken,
      audience: process.env.GOOGLE_CLIENT_ID, // Google Client ID'nizi buraya ekleyin
    });

    
    const user = await User.findOne({ email: tokenInfo.payload.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: hashedPassword, ...rest } = user._doc;
      const expiryDate = new Date(Date.now() + 3600000); // 1 hour
      res
        .cookie('access_token', token, {
          httpOnly: true,
          expires: expiryDate,
        })
        .status(200)
        .json(sendSuccessResponse(200, "Login successful", rest));
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username: tokenInfo.payload.name,
        email: tokenInfo.payload.email,
        password: hashedPassword,
        profilePicture: tokenInfo.payload.picture,
        verified: true,
        authMethod: 'google',
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: hashedPassword2, ...rest } = newUser._doc;
      const expiryDate = new Date(Date.now() + 3600000); // 1 hour
      res
        .cookie('access_token', token, {
          httpOnly: true,
          expires: expiryDate,
        })
        .status(200)
        .json(sendSuccessResponse(200, "Login successful", rest));
    }
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res) => {
  res.clearCookie('access_token').status(200).json('Signout success!');
};
