import mongoose from "mongoose";
import User from "../models/user.model.js";
import Tree from "../models/treeNote.model.js";
import { validationResult, matchedData } from "express-validator";
import { errorHandler } from '../utils/error.js';
import e from "express";



export const createTreeNote = async (req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }
    const { title, parentID, order } = matchedData(req);


    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const createdTreeNote = await Tree.create([{
            userID: req.user.id,
            title: title,
            parent: parentID,
        }], { session });

        if (!createdTreeNote || createdTreeNote.length === 0) {
            throw new Error('TreeNote creation failed');
        }

        const treeNote = createdTreeNote[0];
        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $push: { trees: { _id: treeNote._id, parent_id: treeNote.parent, title: treeNote.title, order: order } } },
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

export const getTreeNote = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    if (id !== req.user.id) {
        return next(errorHandler(403, 'Unauthorized'));
    }

    try {
        const treeNote = await Tree.findOne({ _id: id });
        if (!treeNote) {
            throw new Error('TreeNote not found');
        }

        res.status(200).json({ treeNote });
    } catch (error) {
        next(error);
    }
}

export const deleteTreeNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    if (id !== req.user.id) {
        return next(errorHandler(403, 'Unauthorized'));
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const deleteResult = await Tree.deleteOne({ _id: id }, { session });
        if (!deleteResult.acknowledged || deleteResult.deletedCount !== 1) {
            throw new Error('TreeNote deletion failed');
        }

        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $pull: { trees: { _id: id } } },
            { session }
        );

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw new Error('TreeNote deletion failed');
        }

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message: 'TreeNote deleted successfully' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}


export const updateTreeNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });
    const { title, content, styleModel, children, parentID, order } = matchedData(req);

    if (!title && !parentID && !order) {
        try {
            const result = await Tree.updateOne(
                { _id: id },
                { children: children, content: content, styleModel: styleModel }
            );
            
            if (!result.acknowledged || result.modifiedCount !== 1 || result.matchedCount !== 1) {
                return next(errorHandler(400, 'TreeNote update failed'));
            } else {
                return res.status(200).json({ message: 'TreeNote updated successfully' });
            }
        } catch (error) {
            return next(error);
        }
    } else {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            const updateResult = await Tree.updateOne(
                { _id: id },
                { title: title, parent: parentID, children: children, content: content, styleModel: styleModel },
                { session }
            );

            if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
                throw new Error('TreeNote update failed');
            }

            const updateResultUser = await User.updateOne(
                { _id: req.user.id, 'trees._id': id },
                { $set: { 'trees.$.title': title, 'trees.$.parent_id': parentID, 'trees.$.order': order } },
                { session }
            );

            if (!updateResultUser.acknowledged || updateResultUser.modifiedCount !== 1 || updateResultUser.matchedCount !== 1) {
                throw new Error('TreeNote update failed');
            }

            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({ message: 'TreeNote updated successfully' });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            return next(error);
        }
    }

}
