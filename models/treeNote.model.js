import mongoose from 'mongoose';

const treeNoteSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, default: ''},
    content: { type: String,default: ''},
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Tree' },
}, { timestamps: true });


const Tree = mongoose.model('Tree', treeNoteSchema);

export default Tree;