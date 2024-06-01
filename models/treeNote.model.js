import mongoose from 'mongoose';
import styleSchema from './style.model.js';

const treeNoteSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, default: ''},
    content: { type: String,default: ''},
    styleModel: styleSchema,
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Tree' },
}, { timestamps: true });


const Tree = mongoose.model('Tree', treeNoteSchema);

export default Tree;