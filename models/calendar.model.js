import mongoose from 'mongoose';

// Alt Notlar (Notes) Şeması
const subCalendarSchema = new mongoose.Schema({
    title: { type: String, default: ''},
    content: { type: String, default: '' },
    date: { type: Date, required: true },
    variables: {
        type: Map,
        of: [Number],
        default: {}
    }
}, { timestamps: true });

// Calendar Şeması
const calendarSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String ,default: ''},
    calendars: [subCalendarSchema],
    variables:[String]
}, { timestamps: true });

// Calendar modelini oluştur
const Calendar = mongoose.model('Calendar', calendarSchema);
const SubCalendar = mongoose.model('SubCalendar', subCalendarSchema);

export { Calendar, SubCalendar };