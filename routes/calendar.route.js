import express from 'express';
import { checkSchema } from 'express-validator';
import { IdValidationSchema } from '../validation/id_val.js';
import { verifyToken } from '../middleware/verifyUser.js';
import { createCalendar, createSubCalendar, deleteCalendar, deleteSubCalendar, getCalendar, updateCalendar, updateSubCalendar } from '../controllers/calendar.controller.js';
import { updateCalenderValidationSchema } from '../validation/calendar/updateCalendar.js';
import { createSubCalenderValidationSchema } from '../validation/calendar/createSubCalendar.js';
import { updateSubCalenderValidationSchema } from '../validation/calendar/updateSubCalendar.js';
import { deleteSubCalendarValidationSchema } from '../validation/calendar/deleteSubCalendar.js';



const router = express.Router();

router.post('/create',verifyToken,createCalendar);
router.get('/get/:id',verifyToken,checkSchema(IdValidationSchema),getCalendar);
router.delete('/delete/:id', verifyToken,checkSchema(IdValidationSchema),deleteCalendar);
router.post('/update/:id',verifyToken, checkSchema(updateCalenderValidationSchema),updateCalendar);

router.post('/create/calendars/:id',verifyToken,checkSchema(createSubCalenderValidationSchema),createSubCalendar);
router.post('/update/calendars/:id/:subId',verifyToken, checkSchema(updateSubCalenderValidationSchema),updateSubCalendar);
router.delete('/delete/calendars/:id/:subId',verifyToken, checkSchema(deleteSubCalendarValidationSchema),deleteSubCalendar);

export default router;