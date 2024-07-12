import mongoose from "mongoose";
import { Todo, SubTodo } from "../models/todo.model.js";
import { validationResult, matchedData } from 'express-validator';
import User from '../models/user.model.js';
import { errorHandler } from "../utils/error.js";
import { sendSuccessResponse } from "../utils/success.js";


export const createTodo = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const createdTodo = await Todo.create([{
            userID: req.user.id,
        }], { session });

        if (!createdTodo || createdTodo.length === 0) {
            throw errorHandler(500, 'Todo creation failed');
        }

        const todo = createdTodo[0];

        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $push: { todos: { _id: todo._id, title: todo.title, updatedAt: todo.updatedAt, totalJobs: 0, completedJobs: 0 } } },

        ).session(session);

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw errorHandler(500, 'An error occurred while updating the user\'s todos section.');
        }

        await session.commitTransaction();
        res.status(201).json(sendSuccessResponse(201, 'Todo has been created...', todo));
    } catch (error) {
        if (session.transaction.isActive) {
            await session.abortTransaction();
        }
        next(error);
    } finally {
        session.endSession();
    }
}

export const getTodo = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to fetch todo ', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    try {
        const todo = await Todo.findOne({ _id: id });
        if (!todo) {
            throw errorHandler(404, 'Todo not found');
        }

        if (todo.userID.toString() !== req.user.id) {
            throw errorHandler(403, 'Unauthorized Access when trying to fetch Todo');
        }
        res.status(200).json(sendSuccessResponse(200, 'Todo has been fetched...', todo));
    } catch (error) {
        next(error);
    }
}


export const deleteTodo = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to delete todo', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const todo = await Todo.findOne({ _id: id }).session(session);
        if (!todo) {
            throw errorHandler(404, 'Todo not found when trying to delete Todo')
        }

        if (todo.userID.toString() !== req.user.id) {
            throw errorHandler(403, 'Unauthorized Access when trying to delete Todo');
        }

        const deleteResult = await Todo.deleteOne({ _id: id }).session(session)
        if (!deleteResult.acknowledged || deleteResult.deletedCount !== 1) {
            throw errorHandler(500, 'An error occurred while deleting the todo');
        }

        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $pull: { todos: { _id: id } } },
            { session }
        );

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw errorHandler(500, 'An error occurred while updating the user\'s todos section.');
        }

        await session.commitTransaction();
        res.status(200).json(sendSuccessResponse(200, 'Todo has been deleted...'));
    } catch (error) {
        if (session.transaction.isActive) {
            await session.abortTransaction();
        }
        next(error);
    } finally {
        session.endSession();
    }
}

export const updateTodo = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to update todo', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });
    const { title } = matchedData(req);

    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const todo = await Todo.findOne({ _id: id });
        if (!todo) {
            throw errorHandler(404, 'Todo not found');
        }

        if (todo.userID.toString() !== req.user.id) {
            throw errorHandler(403, 'Unauthorized Access when trying to update Todo');
        }

        if (title === todo.title) {
            throw errorHandler(400, 'No changes detected');
        }

        const updateResult = await todo.updateOne(
            { title },
        ).session(session);

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw errorHandler(500, 'An error occurred while updating the todo');
        }

        const userResult = await User.updateOne(
            { _id: req.user.id, 'todos._id': id },
            { $set: { 'todos.$.title': title } },
        ).session(session);

        if (!userResult.acknowledged || userResult.modifiedCount !== 1 || userResult.matchedCount !== 1) {
            throw errorHandler(500, 'An error occurred while updating the user\'s todos section.');
        }

        await session.commitTransaction();
        res.status(200).json(sendSuccessResponse(200, 'Todo has been updated...'));
    } catch (error) {
        if (session.transaction.isActive) {
            await session.abortTransaction();
        }
        next(error);
    } finally {
        session.endSession();
    }
}



export const createSubTodo = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to create subtodo ', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });
    const { content, priority, completed } = matchedData(req);

    try {
        const todo = await Todo.findOne({ _id: id });
        if (!todo) {
            throw errorHandler(404, 'Todo not found when trying to create SubTodo');
        }

        if (todo.userID.toString() !== req.user.id) {
            throw errorHandler(403, 'Unauthorized Access when trying to create SubTodo');
        }

        const subTodo = new SubTodo(
            {
                content,
                priority,
                completed,
            }
        );
        todo.todos.push(subTodo);

        const updateResult = await todo.save();

        if (!updateResult) {
            throw errorHandler(500, 'SubTodo creation failed');
        }

        res.status(201).json(sendSuccessResponse(201, 'SubTodo has been created...', subTodo));
    } catch (error) {
        next(error);
    }
}


export const updateSubTodo = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to update subtodo', errors.array()));
    }
    const { todoId, subTodoId } = matchedData(req, { locations: ['params'] });
    const { content, completed, priority, styleModel } = matchedData(req);

    try {
        const todo = await Todo.findOne({ _id: todoId });

        if (!todo) {
            throw errorHandler(404, 'Todo not found when trying to update SubTodo');
        }

        if (todo.userID.toString() !== req.user.id) {
            throw errorHandler(403, 'Unauthorized Access when trying to update SubTodo');
        }

        const subTodo = todo.todos.id(subTodoId);

        if (!subTodo) {
            throw errorHandler(404, 'SubTodo not found');
        }

        if (content !== undefined) subTodo.content = content;
        if (completed !== undefined) subTodo.completed = completed;
        if (priority !== undefined) subTodo.priority = priority;
        if (styleModel !== undefined) subTodo.styleModel = styleModel;

        todo.todos.id(subTodoId).set(subTodo);

        const updateResult = await todo.save();

        if (!updateResult) {
            throw errorHandler(500, 'SubTodo update failed  when trying to update SubTodo');
        }

        res.status(200).json({ message: 'SubTodo updated successfully' });
    } catch (error) {
        next(error);
    }
}


export const deleteSubTodo = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to delete subtodo ', errors.array()));
    }
    const { todoId, subTodoId } = matchedData(req, { locations: ['params'] });

    try {
        const todo = await Todo.findOne({ _id: todoId });

        if (!todo) {
            throw errorHandler(404, 'Todo not found when trying to delete SubTodo');
        }

        if (todo.userID.toString() !== req.user.id) {
            throw errorHandler(403, 'Unauthorized Access when trying to delete SubTodo');
        }

        const subTodo = todo.todos.id(subTodoId);

        if (!subTodo) {
            throw errorHandler(404, 'SubTodo not found when trying to delete SubTodo');
        }

        const updateResult = await Todo.updateOne(
            { _id: todoId },
            { $pull: { todos: { _id: subTodoId } } },
        );

        if (!updateResult) {
            throw errorHandler(500, 'SubTodo deletion failed');
        }

        res.status(200).json({ message: 'SubTodo deleted successfully' });
    } catch (error) {
        next(error);
    }
}