import express from 'express';
import { checkSchema } from 'express-validator';
import { createNote, deleteNote, updateNote , getNote } from '../controllers/note.controller.js';
import { IdValidationSchema } from '../validation/id_val.js';
import { verifyToken } from '../middleware/verifyUser.js';
import { updateNoteValidationSchema } from '../validation/note/updateNote.js';



const router = express.Router();

router.post('/create',verifyToken,createNote);
router.get('/get/:id',verifyToken,checkSchema(IdValidationSchema),getNote);
router.delete('/delete/:id', verifyToken,checkSchema(IdValidationSchema),deleteNote);
router.post('/update/:id',verifyToken, checkSchema(updateNoteValidationSchema),updateNote);

export default router;