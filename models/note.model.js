import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, default: ''},
    content: { type: String, default: ''},
    variables: {
        type: Map,
        of: [Number],
        default: {}
    }
}, { timestamps: true });


const Note = mongoose.model('Note', noteSchema);

export default Note;