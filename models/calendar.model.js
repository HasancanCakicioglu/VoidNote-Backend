import mongoose from 'mongoose';
import styleSchema from './style.model.js';

// Alt Notlar (Notes) Şeması
const subCalendarSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, default: '' },
    style: styleSchema,
    date: { type: Date, required: true },
}, { timestamps: true });

// Calendar Şeması
const calendarSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String ,default: ''},
    calenders: [{ date: { type: [Date] }, title: { type: String } }],
    notes: [subCalendarSchema]
}, { timestamps: true });

// Calendar modelini oluştur
const Calendar = mongoose.model('Calendar', calendarSchema);
const SubCalendar = mongoose.model('SubCalendar', subCalendarSchema);

export { Calendar, SubCalendar };