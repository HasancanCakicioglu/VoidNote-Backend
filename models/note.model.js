import mongoose from 'mongoose';
import styleSchema from './style.model.js';

const noteSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    styleModel: styleSchema,
}, { timestamps: true });


const Note = mongoose.model('Note', noteSchema);

export default Note;