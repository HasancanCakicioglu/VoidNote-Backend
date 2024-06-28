import express from 'express';
import { signin, signup, google, signout , verifyEmail } from '../controllers/auth.controller.js';
import { checkSchema } from 'express-validator';
import { signUpValidationSchema } from '../validation/auth/signup.js';
import { signInValidationSchema } from '../validation/auth/signin.js';
import { googleValidationSchema } from '../validation/auth/google.js';
import { verifyEmailValidationSchema } from '../validation/auth/verifyEmail.js';

const router = express.Router();

router.post('/signup',checkSchema(signUpValidationSchema),signup);
router.post('/verify',checkSchema(verifyEmailValidationSchema),verifyEmail);
router.post('/signin',checkSchema(signInValidationSchema) ,signin);
router.post('/google',checkSchema(googleValidationSchema) ,google);
router.get('/signout', signout);

export default router;
