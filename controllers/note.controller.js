import { errorHandler } from '../utils/error.js';
import { validationResult, matchedData } from 'express-validator';
import Note from '../models/note.model.js';
import mongoose from 'mongoose';
import User from '../models/user.model.js';


export const createNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }
    const { title, content, styleModel } = matchedData(req);

    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const createdNote = await Note.create([{
            userID: req.user.id,
            title,
            content,
            styleModel,
        }], { session });

        if (!createdNote || createdNote.length === 0) {
            throw new Error('Note creation failed');
        }

        const note = createdNote[0];
        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $push: { notes: { _id: note._id, title: note.title } } },
            { session }
        );

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw new Error('Note creation failed');
        }

        await session.commitTransaction();
        session.endSession();
        res.status(201).json({ message: 'Note created successfully' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}


export const getNote = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    try {
        const note = await Note.findById(id);
        if (!note) return next(errorHandler(404, 'Note not found'));

        res.status(200).json(note);
    } catch (error) {
        next(error);
    }
}

export const deleteNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    const session = await mongoose.startSession();


    try {
        session.startTransaction();

        const note = await Note.findById(id).session(session);
        if (!note) {
            await session.abortTransaction();
            session.endSession();
            return next(errorHandler(404, 'Note not found'));
        }

        if (note.userID.toString() !== req.user.id) {
            await session.abortTransaction();
            session.endSession();
            return next(errorHandler(403, 'You can delete only your note!'));
        }

        await Note.deleteOne({ _id: id }).session(session);

        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $pull: { notes: { _id: note._id } } },
            { session }
        );

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1) {
            throw new Error('User update failed');
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
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });
    const { title, content, styleModel } = matchedData(req);

    try {
        const note = await Note.findById(id);
        if (!note) return next(errorHandler(404, 'Note not found'));

        if (note.userID.toString() !== req.user.id) {
            return next(errorHandler(403, 'You can update only your note!'));
        }

        if (title && title !== note.title) {
            const session = await mongoose.startSession();
            try {
                session.startTransaction();

                const updatedNote = await note.updateOne({ title, content, styleModel }, { session, new: true });

                if (!updatedNote) {
                    throw new Error('User update failed');
                }

                const updateResult = await User.updateOne(
                    { _id: req.user.id, 'notes._id': id },
                    { $set: { 'notes.$.title': title } },
                    { session }
                );

                if (!updateResult.acknowledged || updateResult.modifiedCount !== 1) {
                    throw new Error('User update failed');
                }

                await session.commitTransaction();
                session.endSession();
                return res.status(200).json("Note has been updated...");

            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                return next(errorHandler(500, 'Note update failed'));
            }
        } else {
            await note.updateOne({ title, content, styleModel });
            return res.status(200).json("Note has been updated...");
        }

    } catch (error) {
        next(error);
    }
}