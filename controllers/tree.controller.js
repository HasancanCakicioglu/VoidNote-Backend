import mongoose from "mongoose";
import User from "./user.model.js";


export const createTreeNote = async (req, res) => {
    

    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const createdTreeNote = await TreeNote.create([{
            userID: req.user.id,
            title,
            content,
            styles,
            depth,
            branch
        }], { session });

        if (!createdTreeNote || createdTreeNote.length === 0) {
            throw new Error('TreeNote creation failed');
        }

        const treeNote = createdTreeNote[0];
        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $push: { treeNotes: { _id: treeNote._id, title: treeNote.title } } },
            { session }
        );

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw new Error('TreeNote creation failed');
        }

        await session.commitTransaction();
        session.endSession();
        res.status(201).json({ message: 'TreeNote created successfully' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}