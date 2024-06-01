import mongoose from "mongoose";
import User from "../models/user.model.js";
import Tree from "../models/treeNote.model.js";
import { validationResult, matchedData } from "express-validator";
import { errorHandler } from '../utils/error.js';



export const createTreeNote = async (req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to create tree', errors.array()));
    }
    const {parentID} = matchedData(req);

    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const createdTreeNote = await Tree.create([{
            userID: req.user.id,
            parent: parentID,
        }], { session });

        if (!createdTreeNote || createdTreeNote.length === 0) {
            throw errorHandler(500, 'TreeNote creation failed');
        }

        const treeNote = createdTreeNote[0];
        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $push: { trees: { _id: treeNote._id, parent_id: treeNote.parent ,title:treeNote.title } } },
            { session }
        );

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw errorHandler(500, 'An error occurred while updating the user\'s trees section.');
        }

        await session.commitTransaction();
        session.endSession();
        res.status(201).json({ message: 'TreeNote created successfully', data: treeNote});
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const getTreeNote = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to fetch tree', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    try {
        const treeNote = await Tree.findOne({ _id: id });
        if (!treeNote) {
            throw errorHandler(404, 'TreeNote not found when trying to fetch TreeNote');
        }

        if (treeNote.userID.toString() !== req.user.id) {
            throw errorHandler(403, 'Unauthorized Access when trying to fetch TreeNote');
        }

        res.status(200).json({ message: 'TreeNote fetched successfully', data: treeNote });
    } catch (error) {
        next(error);
    }
}

export const deleteTreeNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to delete Tree', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        
        const treeNote = await Tree.findById(id).session(session);
        if (!treeNote) {
            throw errorHandler(404, 'TreeNote not found');
        }

        if (treeNote.userID.toString() !== req.user.id) {
            throw errorHandler(403, 'Unauthorized Access when trying to delete TreeNote');
        }

        const deleteResult = await Tree.deleteOne({ _id: id }, { session });

        if (!deleteResult.acknowledged || deleteResult.deletedCount !== 1) {
            throw errorHandler(500, 'TreeNote deletion failed');
        }

        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $pull: { trees: { _id: id } } },
            { session }
        );

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw errorHandler(500, 'An error occurred while updating the user\'s trees section.');
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
        return next(errorHandler(400, 'Validation fails when trying to update Tree', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });
    const { title, content, styleModel,parentID } = matchedData(req);

    if (!title && !parentID) {
        try {
            const treeNote = await Tree.findOne({ _id});
            if (!treeNote) {
                return next(errorHandler(404, 'TreeNote not found'));
            }

            if (treeNote.userID.toString() !== req.user.id) {
                return next(errorHandler(403, 'Unauthorized Access when trying to update TreeNote'));
            }

            const result = await Tree.updateOne(
                { _id: id },
                { content: content, styleModel: styleModel }
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

            const treeNote = await Tree.findOne({ _id: id }).session(session);
            if (!treeNote) {
                throw errorHandler(404, 'TreeNote not found');
            }

            if (treeNote.userID.toString() !== req.user.id) {
                throw errorHandler(403, 'Unauthorized Access when trying to update TreeNote');
            }

            const updateResult = await Tree.updateOne(
                { _id: id },
                { title: title, parent: parentID, content: content, styleModel: styleModel },
                { session }
            );

            if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
                throw errorHandler(500, 'TreeNote update failed');
            }

            const updateResultUser = await User.updateOne(
                { _id: req.user.id, 'trees._id': id },
                { $set: { 'trees.$.title': title, 'trees.$.parent_id': parentID } },
                { session }
            );

            if (!updateResultUser.acknowledged || updateResultUser.modifiedCount !== 1 || updateResultUser.matchedCount !== 1) {
                throw errorHandler(500, 'An error occurred while updating the user\'s trees section.');
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
