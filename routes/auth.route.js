import express from 'express';
import { signin, signup, google, signout , verifyEmail,forgetPassword,verifyForgetPassword,resendVerificationEmail } from '../controllers/auth.controller.js';
import { check, checkSchema } from 'express-validator';
import { signUpValidationSchema } from '../validation/auth/signup.js';
import { signInValidationSchema } from '../validation/auth/signin.js';
import { googleValidationSchema } from '../validation/auth/google.js';
import { verifyEmailValidationSchema } from '../validation/auth/verifyEmail.js';
import { forgetPasswordValidationSchema } from '../validation/auth/forgetPassword.js';
import { verifyForgetPasswordValidationSchema } from '../validation/auth/verifyForgetPassword.js';
import { resendVerificationEmailValidationSchema } from '../validation/auth/resendVerificationEmail.js';

const router = express.Router();

router.post('/signup',checkSchema(signUpValidationSchema),signup);
router.post('/verify',checkSchema(verifyEmailValidationSchema),verifyEmail);
router.post('/resendVerificationEmail',checkSchema(resendVerificationEmailValidationSchema),resendVerificationEmail);
router.post('/signin',checkSchema(signInValidationSchema) ,signin);
router.post('/google',checkSchema(googleValidationSchema) ,google);
router.post('/forgetPassword',checkSchema(forgetPasswordValidationSchema),forgetPassword);
router.post('/verifyForgetPassword',checkSchema(verifyForgetPasswordValidationSchema),verifyForgetPassword);
router.get('/signout', signout);

export default router;
