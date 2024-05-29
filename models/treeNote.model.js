import mongoose from 'mongoose';

const treeNoteSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    styles: styleSchema,
    depth: { type: Number, required: true },
    branch: [branchSchema]
}, { timestamps: true });


const branchSchema = new mongoose.Schema({
    title: { type: String, required: true },
    branch: [{
        _id: mongoose.Schema.Types.ObjectId,
        title: {type: String, required: true},
        branch: [branchSchema],  
        order: {type: Number, required: true},
        required: false
    }],
    order: { type: Number, required: true }
});

export default treeNoteSchema;