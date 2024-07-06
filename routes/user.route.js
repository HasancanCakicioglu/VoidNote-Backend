import express from 'express';
import {
  updateUser,
  deleteUser,
  getUser
} from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';
import { checkSchema } from 'express-validator';
import { updateUserValidationSchema } from '../validation/user/updateUser.js';
import { deleteUserValidationSchema } from '../validation/user/deleteUser.js';
import { getUserValidationSchema } from '../validation/user/getUser.js';

const router = express.Router();

router.post('/update/:id',verifyToken,checkSchema(updateUserValidationSchema),updateUser);
router.post('/get',verifyToken,checkSchema(getUserValidationSchema),getUser);
router.delete('/delete/:id', verifyToken, checkSchema(deleteUserValidationSchema),deleteUser);

export default router;
