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

const findAllChildren = async (treeId, userTrees) => {
  const children = [];
  const findChildrenRecursively = (id) => {
      const node = userTrees.find(tree => tree._id.toString() === id.toString());
      if (node) {
        children.push(id.toString()); // Ensure ID is of type ObjectId
        node.children_id.forEach(childId => findChildrenRecursively(childId));
      }
  };
  findChildrenRecursively(treeId);
  return children;
};

export const deleteTreeNote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return next(errorHandler(400, 'Validation fails when trying to delete Tree', errors.array()));
  }

  const { id } = matchedData(req, { locations: ['params'] });
  const session = await mongoose.startSession();

  try {
      session.startTransaction();

      const user = await User.findById(req.user.id).session(session);
      if (!user) {
          throw errorHandler(404, 'User not found');
      }

      const treeNote = user.trees.find(tree => tree._id.toString() === id);
      if (!treeNote) {
          throw errorHandler(404, 'TreeNote not found in user\'s trees');
      }

      // Find all children of the tree note to be deleted
      const allIdsToDelete = await findAllChildren(id, user.trees);

      const objectIdsToDelete = allIdsToDelete.map(id => new mongoose.Types.ObjectId(id));

      // Delete all tree notes
      const deleteResult = await Tree.deleteMany({ _id: { $in: allIdsToDelete } }, { session });
      if (!deleteResult.acknowledged || deleteResult.deletedCount !== allIdsToDelete.length) {
          throw errorHandler(500, 'TreeNote deletion failed');
      }

      // Remove the tree notes from the user's trees array
      const updateResult = await User.updateOne(
          { _id: req.user.id },
          { $pull: { trees: { _id: { $in: objectIdsToDelete } } } },
          { session }
      );

      if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
          throw errorHandler(500, 'An error occurred while updating the user\'s trees section.');
      }

      const parent_id = treeNote.parent_id;
      if (parent_id) {
          const updatedResult = await User.updateOne(
              { _id: req.user.id, 'trees._id': new mongoose.Types.ObjectId(parent_id) },
              { $pull: { 'trees.$.children_id': new mongoose.Types.ObjectId(id)} },
              { session }
          );

          if (!updatedResult.acknowledged || updatedResult.modifiedCount !== 1 || updatedResult.matchedCount !== 1) {
              throw errorHandler(500, 'An error occurred while updating the user\'s trees section.');
          }

      }

      await session.commitTransaction();
      res.status(200).json(sendSuccessResponse(200, 'TreeNote and its children have been deleted...', []));
  } catch (error) {
    console.log(error);
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
    const { title, content, brief,variables } = matchedData(req);

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
            { title: title, content: content ,variables:variables},
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


export const getTreeNoteVariable = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to fetch tree', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    try {

        const treeNote = await Tree.findById(id, { userID: 1, variables: 1 });

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


