import express from 'express';
import { checkSchema } from 'express-validator';
import { updateNote } from '../controllers/note.controller.js';
import { IdValidationSchema } from '../validation/id_val.js';
import { verifyToken } from '../middleware/verifyUser.js';
import { createTodoValidationSchema } from '../validation/todo/createTodo.js';
import { createSubTodo, createTodo, deleteSubTodo, deleteTodo, getTodo, updateSubTodo, updateTodo } from '../controllers/todo.controller.js';
import { updateTodoValidationSchema } from '../validation/todo/updateTodo.js';
import { updateSubTodoValidationSchema } from '../validation/todo/updateSubTodo.js';
import { deleteSubTodoValidationSchema } from '../validation/todo/deleteSubTodo.js';



const router = express.Router();

router.post('/create',verifyToken,checkSchema(createTodoValidationSchema),createTodo);
router.get('/get/:id',verifyToken,checkSchema(IdValidationSchema),getTodo);
router.delete('/delete/:id', verifyToken,checkSchema(IdValidationSchema),deleteTodo);
router.post('/update/:id',verifyToken, checkSchema(updateTodoValidationSchema),updateTodo);

router.post('/create/todos/:id',verifyToken,checkSchema(IdValidationSchema),createSubTodo);
router.post('/update/todos/:todoId/:subTodoId',verifyToken, checkSchema(updateSubTodoValidationSchema),updateSubTodo);
router.delete('/delete/todos/:todoId/:subTodoId',verifyToken, checkSchema(deleteSubTodoValidationSchema),deleteSubTodo);


export default router;