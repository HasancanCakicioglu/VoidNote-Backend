import mongoose from 'mongoose';

// Alt Notlar (Notes) Şeması
const calenderNoteSchema = new mongoose.Schema({
    content: { type: String, required: true },
    style: { type: String },
    date: { type: Date, required: true },
    recursive: [{ type: Number }]
}, { timestamps: true });

// Calendar Şeması
const calendarSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String },
    shifted: { type: Boolean, default: false },
    notes: [calenderNoteSchema]
}, { timestamps: true });

// Calendar modelini oluştur
const Calendar = mongoose.model('Calendar', calendarSchema);

export default Calendar;