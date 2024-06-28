import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import { validationResult, matchedData } from 'express-validator';
import { transporter } from "../config/nodemailer.js"



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

    if (existingUser && !existingUser.verified) {
      await User.findByIdAndDelete(existingUser._id);
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const verificationCode = Math.random().toString(36).slice(-6);
    const verificationCodeExpires = new Date(Date.now() + 300000); // 5 minutes


    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification Code',
      html: `<h3>Please use the following code to verify your email:</h3><p><b>${verificationCode}</b></p>`
    });

    const newUser = new User({ username, email, password: hashedPassword, verificationCode: verificationCode, verificationCodeExpires: verificationCodeExpires });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
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
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (user.verificationCode !== verificationCode || new Date() > user.verificationCodeExpires) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.verified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
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
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errorHandler(400, 'Validation failed', errors.array()));
  }

  const { username, email, photo } = matchedData(req);

  try {
    const user = await User.findOne({ email: email });
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
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username: username,
        email: email,
        password: hashedPassword,
        profilePicture: photo,
        verified: true,
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
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res) => {
  res.clearCookie('access_token').status(200).json('Signout success!');
};
