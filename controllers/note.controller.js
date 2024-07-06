import { errorHandler } from '../utils/error.js';
import { validationResult, matchedData } from 'express-validator';
import Note from '../models/note.model.js';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { sendSuccessResponse } from '../utils/success.js';



export const createNote = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const createdNote = await Note.create([{
            userID: req.user.id,
        }], { session });

        if (!createdNote || createdNote.length === 0) {
            throw errorHandler(500, 'Note creation failed');
        }

        const note = createdNote[0];

        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $push: { notes: { _id: note._id, title: note.title } } },
            { session }
        );

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw errorHandler(500, 'An error occurred while updating the user\'s notes section.');
        }

        await session.commitTransaction();
        session.endSession();
        res.status(201).json(sendSuccessResponse(201,'Note has been created...', note));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}


export const getNote = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to fetch note', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    try {
        const note = await Note.findById(id);
        if (!note) return next(errorHandler(404, 'Note not found'));
        
        if (note.userID.toString() !== req.user.id) {
            return next(errorHandler(403, 'Unauthorized Access when trying to fetch Note'));
        }
        res.status(200).json(sendSuccessResponse(200,'Note has been fetched...', note));
    } catch (error) {
        next(error);
    }
}

export const deleteNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400,'Validation fails when trying to delete note', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const note = await Note.findById(id).session(session);
        if (!note) {
            throw errorHandler(404, 'Note not found');
        }

        if (note.userID.toString() !== req.user.id) {
            throw errorHandler(403, 'Unauthorized Access when trying to delete Note');
        }

        await Note.deleteOne({ _id: id }).session(session);

        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $pull: { notes: { _id: note._id } } },
            { session }
        );

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1) {
            throw errorHandler(500, 'An error occurred while updating the user\'s notes section.');
        }

        await session.commitTransaction();
        session.endSession();
        res.status(200).json('Note has been deleted...');
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const updateNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to update note', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });
    const { title, content, styleModel } = matchedData(req);

    try {
        const note = await Note.findById(id);
        if (!note) return next(errorHandler(404, 'Note not found'));

        if (note.userID.toString() !== req.user.id) {
            return next(errorHandler(403, 'Unauthorized Access when trying to update Note'));
        }

        if (title && title !== note.title) {
            const session = await mongoose.startSession();
            try {
                session.startTransaction();

                const updatedNote = await note.updateOne({ title, content, styleModel }, { session });

                if (!updatedNote || !updatedNote.acknowledged || updatedNote.modifiedCount !== 1 || updatedNote.matchedCount !== 1) {
                    throw errorHandler(500, 'Note update failed');
                }

                const updateResult = await User.updateOne(
                    { _id: req.user.id, 'notes._id': id },
                    { $set: { 'notes.$.title': title } },
                    { session }
                );

                if (!updateResult || !updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
                    throw errorHandler(500, 'An error occurred while updating the user\'s notes section.');
                }

                await session.commitTransaction();
                session.endSession();
                return res.status(200).json("Note has been updated...");

            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                return next(error);
            }
        } else {
            const updatedNote = await note.updateOne({ title, content, styleModel });

            if (!updatedNote || !updatedNote.acknowledged || updatedNote.modifiedCount !== 1 || updatedNote.matchedCount !== 1) {
                throw errorHandler(500, 'Note update failed');
            }
            return res.status(200).json("Note has been updated...");
        }

    } catch (error) {
        next(error);
    }
}