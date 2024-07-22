import express from 'express';
import { checkSchema } from 'express-validator';
import { IdValidationSchema } from '../validation/id_val.js';
import { verifyToken } from '../middleware/verifyUser.js';
import { createCalendar, createSubCalendar, deleteCalendar, deleteSubCalendar, getCalendar, getCalendarVariables, getSubCalendar, updateCalendar, updateSubCalendar } from '../controllers/calendar.controller.js';
import { updateCalenderValidationSchema } from '../validation/calendar/updateCalendar.js';
import { createSubCalenderValidationSchema } from '../validation/calendar/createSubCalendar.js';
import { updateSubCalenderValidationSchema } from '../validation/calendar/updateSubCalendar.js';
import { deleteSubCalendarValidationSchema } from '../validation/calendar/deleteSubCalendar.js';
import { getSubCalenderValidationSchema } from '../validation/calendar/getSubCalendar.js';



const router = express.Router();

router.post('/create',verifyToken,createCalendar);
router.get('/get/:id',verifyToken,checkSchema(IdValidationSchema),getCalendar);
router.get('/get/variable/:id',verifyToken,checkSchema(IdValidationSchema),getCalendarVariables);
router.delete('/delete/:id', verifyToken,checkSchema(IdValidationSchema),deleteCalendar);
router.post('/update/:id',verifyToken, checkSchema(updateCalenderValidationSchema),updateCalendar);

router.post('/create/sub/:id',verifyToken,checkSchema(createSubCalenderValidationSchema),createSubCalendar);
router.post('/update/sub/:id/:subId',verifyToken, checkSchema(updateSubCalenderValidationSchema),updateSubCalendar);
router.delete('/delete/sub/:id/:subId',verifyToken, checkSchema(deleteSubCalendarValidationSchema),deleteSubCalendar);
router.get('/get/sub/:id/:subId',verifyToken, checkSchema(getSubCalenderValidationSchema),getSubCalendar);

export default router;