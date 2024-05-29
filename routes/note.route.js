import express from 'express';
import { checkSchema } from 'express-validator';
import { createNote, deleteNote, updateNote , getNote } from '../controllers/note.controller.js';
import { createNoteValidationSchema } from '../validation/note/createNote.js';
import { noteIdValidationSchema } from '../validation/note/NoteID.js';
import { verifyToken } from '../middleware/verifyUser.js';
import { updateNoteValidationSchema } from '../validation/note/updateNote.js';



const router = express.Router();

router.post('/create',verifyToken,checkSchema(createNoteValidationSchema),createNote);
router.get('/get/:id',verifyToken,checkSchema(noteIdValidationSchema),getNote);
router.get('/delete/:id', verifyToken,checkSchema(noteIdValidationSchema),deleteNote);
router.get('/update/:id',verifyToken, checkSchema(updateNoteValidationSchema),updateNote);

export default router;