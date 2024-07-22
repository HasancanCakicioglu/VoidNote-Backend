import express from 'express';
import { checkSchema } from 'express-validator';
import { IdValidationSchema } from '../validation/id_val.js';
import { verifyToken } from '../middleware/verifyUser.js';
import { createTreeNote, deleteTreeNote, getTreeNote, getTreeNoteVariable, updateTreeNote } from '../controllers/tree.controller.js';
import { createTreeValidationSchema } from '../validation/tree/createTree.js';
import { updateTreeValidationSchema } from '../validation/tree/updateTree.js';



const router = express.Router();

router.post('/create',verifyToken,checkSchema(createTreeValidationSchema),createTreeNote);
router.get('/get/:id',verifyToken,checkSchema(IdValidationSchema),getTreeNote);
router.get('/get/variable/:id',verifyToken,checkSchema(IdValidationSchema),getTreeNoteVariable);
router.delete('/delete/:id', verifyToken,checkSchema(IdValidationSchema),deleteTreeNote);
router.post('/update/:id',verifyToken, checkSchema(updateTreeValidationSchema),updateTreeNote);

export default router;