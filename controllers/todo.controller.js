import mongoose from "mongoose";
import {Todo,SubTodo} from "../models/todo.model.js";
import { validationResult, matchedData } from 'express-validator';
import User from '../models/user.model.js';


export const createTodo = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }
    const { title } = matchedData(req);

    const session = await mongoose.startSession();

    try {

        session.startTransaction();
        const createdTodo = await Todo.create([{
            userID: req.user.id,
            title,
        }], { session });

        if (!createdTodo || createdTodo.length === 0) {
            throw new Error('todo creation failed');
        }

        const todo = createdTodo[0];

        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $push: { todos: { _id: todo._id, title: todo.title } } },
            
        ).session(session);

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw new Error('todo creation failed');
        }

        await session.commitTransaction();
        session.endSession();
        res.status(201).json({ message: 'todo created successfully' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const getTodo = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    try {
        const todo = await Todo.findOne({ _id: id});
        if (!todo) {
            throw new Error('Todo not found');
        }

        if (todo.userID.toString() !== req.user.id) {
            throw new Error('Unauthorized');
        }

        res.status(200).json({ todo });
    } catch (error) {
        next(error);
    }
}


export const deleteTodo = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const todo = await Todo.findOne({ _id: id }).session(session);
        if (!todo) {
            throw new Error('Todo not found');
        }

        if (todo.userID.toString() !== req.user.id) {
            throw new Error('Unauthorized');
        }

        const deleteResult = await Todo.deleteOne({ _id: id }).session(session)
        if (!deleteResult.acknowledged || deleteResult.deletedCount !== 1) {
            throw new Error('Todo deletion failed');
        }

        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $pull: { todos: { _id: id } } },
            { session }
        );

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw new Error('Todo deletion failed');
        }

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const updateTodo = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });
    const { title} = matchedData(req);

    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const todo = await Todo.findOne({ _id: id });
        if (!todo) {
            throw new Error('Todo not found');
        }

        if (todo.userID.toString() !== req.user.id) {
            throw new Error('Unauthorized');
        }

        const updateResult = await todo.updateOne(
            { title },
        ).session(session);

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw new Error('Todo update failed');
        }

        const userResult = await User.updateOne(
            { _id: req.user.id, 'todos._id': id },
            { $set: { 'todos.$.title': title } },
        ).session(session);

        if (!userResult.acknowledged || userResult.modifiedCount !== 1 || userResult.matchedCount !== 1) {
            throw new Error('Todo update failed');
        }

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message: 'Todo updated successfully' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}



export const createSubTodo = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    try {
        const todo = await Todo.findOne({ _id: id });
        if (!todo) {
            throw new Error('Todo not found');
        }

        if (todo.userID.toString() !== req.user.id) {
            throw new Error('Unauthorized');
        }

        const subTodo = {
        };

        todo.todos.push(subTodo);

        const updateResult = await todo.save();

        if (!updateResult) {
            throw new Error('SubTodo creation failed');
        }

        res.status(201).json({ message: 'SubTodo created successfully' });
    } catch (error) {
        next(error);
    }
}


export const updateSubTodo = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }
    const { todoId, subTodoId } = matchedData(req, { locations: ['params'] });
    const { content, completed, priority ,styleModel} = matchedData(req);

    try {
        const todo = await Todo.findOne({ _id: todoId });

        if (!todo) {
            throw new Error('Todo not found');
        }

        if (todo.userID.toString() !== req.user.id) {
            throw new Error('Unauthorized');
        }

        const subTodo = todo.todos.id(subTodoId);

        if (!subTodo) {
            throw new Error('SubTodo not found');
        }

        subTodo.content = content;
        subTodo.completed = completed;
        subTodo.priority = priority;
        subTodo.styleModel = styleModel;

        todo.todos.id(subTodoId).set(subTodo);

        const updateResult = await todo.save();

        if (!updateResult) {
            throw new Error('SubTodo update failed');
        }

        res.status(200).json({ message: 'SubTodo updated successfully' });
    } catch (error) {
        next(error);
    }
}


export const deleteSubTodo = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }
    const { todoId, subTodoId } = matchedData(req, { locations: ['params'] });

    try {
        const todo = await Todo.findOne({ _id: todoId });

        if (!todo) {
            throw new Error('Todo not found');
        }

        if (todo.userID.toString() !== req.user.id) {
            throw new Error('Unauthorized');
        }

        const subTodo = todo.todos.id(subTodoId);

        if (!subTodo) {
            throw new Error('SubTodo not found');
        }

        const updateResult = await Todo.updateOne(
            { _id: todoId },
            { $pull: { todos: { _id: subTodoId } } },
        );

        if (!updateResult) {
            throw new Error('SubTodo deletion failed');
        }

        res.status(200).json({ message: 'SubTodo deleted successfully' });
    } catch (error) {
        next(error);
    }
}