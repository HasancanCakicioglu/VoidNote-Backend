import mongoose from "mongoose";
import User from "../models/user.model.js";
import Tree from "../models/treeNote.model.js";
import { validationResult, matchedData } from "express-validator";
import { errorHandler } from '../utils/error.js';
import { sendSuccessResponse } from '../utils/success.js';



export const createTreeNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to create tree', errors.array()));
    }
    const { parent_id } = matchedData(req);

    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const createdTreeNote = await Tree.create([{
            userID: req.user.id,
            parent: parent_id,
        }], { session });

        if (!createdTreeNote || createdTreeNote.length === 0) {
            throw errorHandler(500, 'TreeNote creation failed');
        }

        const treeNote = createdTreeNote[0];
        
        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $push: { trees: { _id: treeNote._id, parent_id: treeNote.parent, title: treeNote.title, updatedAt: treeNote.updatedAt } } },
            { session }
        );

        if (treeNote.parent) {
            await User.updateOne(
              { _id: req.user.id, 'trees._id': treeNote.parent },
              { $addToSet: { 'trees.$.children_id': treeNote._id } },
              { session }
            );
          }          
    

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw errorHandler(500, 'An error occurred while updating the user\'s trees section.');
        }

        await session.commitTransaction();
        res.status(201).json(sendSuccessResponse(201, 'TreeNote has been created...', treeNote));
    } catch (error) {
        if (session.transaction.isActive) { // Check if the transaction is active
            await session.abortTransaction();
        }
        next(error);
    } finally {
        session.endSession(); // Ensure session ends properly in all cases
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

        res.status(200).json(sendSuccessResponse(200, 'TreeNote has been fetched...', treeNote));
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
  
      // Remove the tree note from the user's trees array
      const updateResult = await User.updateOne(
        { _id: req.user.id },
        { $pull: { trees: { _id: id } } },
        { session }
      );
      if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
        throw errorHandler(500, 'An error occurred while updating the user\'s trees section.');
      }
  
      // Update the parent tree's children_id array if the tree note has a parent
      if (treeNote.parent) {
        const parentUpdateResult = await User.updateOne(
          { _id: req.user.id, 'trees._id': treeNote.parent },
          { $pull: { 'trees.$.children_id': treeNote._id } },
          { session }
        );
        if (!parentUpdateResult.acknowledged || parentUpdateResult.modifiedCount !== 1 || parentUpdateResult.matchedCount !== 1) {
          throw errorHandler(500, 'An error occurred while updating the parent tree\'s children section.');
        }
      }
  
      await session.commitTransaction();
      res.status(200).json(sendSuccessResponse(200, 'TreeNote has been deleted...', []));
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      next(error);
    } finally {
      session.endSession();
    }
  };

export const updateTreeNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to update Tree', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });
    const { title, content, brief } = matchedData(req);

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
            { title: title, content: content },
            { session }
        );

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw errorHandler(500, 'TreeNote update failed');
        }

        const updateResultUser = await User.updateOne(
            { _id: req.user.id, 'trees._id': id },
            { $set: { 'trees.$.title': title, "trees.$.brief": brief, "trees.$.updatedAt": Date.now() } },
            { session }
        );

        if (!updateResultUser.acknowledged || updateResultUser.modifiedCount !== 1 || updateResultUser.matchedCount !== 1) {
            throw errorHandler(500, 'An error occurred while updating the user\'s trees section.');
        }

        await session.commitTransaction();
        return res.status(200).json(sendSuccessResponse(200, 'TreeNote has been updated...', []));
    } catch (error) {
        if (session.transaction.isActive) {
            await session.abortTransaction();
        }
        next(error);
    } finally {
        session.endSession();
    }
}


