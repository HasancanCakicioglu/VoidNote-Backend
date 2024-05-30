import mongoose from 'mongoose';

const treeNoteSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    content: { type: String, required: true ,default: ''},
    styles: styleSchema,
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Tree' },
}, { timestamps: true });


const Tree = mongoose.model('Tree', treeNoteSchema);

export default Tree;