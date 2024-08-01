import { errorHandler } from '../utils/error.js';
import { validationResult, matchedData } from 'express-validator';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { Calendar ,SubCalendar} from '../models/calendar.model.js';
import { sendSuccessResponse } from '../utils/success.js';


export const createCalendar = async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const createdcalendar = await Calendar.create([{
            userID: req.user.id,
        }], { session });

        if (!createdcalendar || createdcalendar.length === 0) {
            throw errorHandler(500, 'Calendar creation failed');
        }

        const calendar = createdcalendar[0];
        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $push: { calendars: { _id: calendar._id, title: calendar.title } } },
            { session }
        );

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw errorHandler(500, 'An error occurred while updating the user\'s calendars section.');
        }

        await session.commitTransaction();
        session.endSession();
        res.status(201).json(sendSuccessResponse(201, 'Calendar has been created...', calendar));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const getCalendar = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to get calendar', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    try {
        const calendar = await Calendar.findOne({ _id: id });

        if (!calendar) {
            throw errorHandler(404, 'Calendar not found when trying to fetch Calendar');
        }

        if (calendar.userID.toString() !== req.user.id) {
            throw errorHandler(403, 'Unauthorized Access when trying to fetch Calendar');
        }

        res.status(200).json(sendSuccessResponse(200, 'Calendar has been fetched...', calendar));
    } catch (error) {
        next(error);
    }
}

export const deleteCalendar = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to delete calendar', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const calendar = await Calendar.findOne({
            _id: id,
        });

        if (!calendar) {
            throw errorHandler(404, 'Calendar not found when trying to delete Calendar');
        }

        if (calendar.userID.toString() !== req.user.id) {
            throw errorHandler(403, 'Unauthorized Access when trying to delete Calendar');
        }

        const deleteResult = await Calendar.deleteOne({ _id: id }, { session });

        if (!deleteResult.acknowledged || deleteResult.deletedCount !== 1) {
            throw errorHandler(500, 'Calendar deletion failed when trying to delete Calendar');
        }

        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $pull: { calendars: { _id: id } } },
            { session }
        );

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw errorHandler(500, 'An error occurred while updating the user\'s calendars section.');
        }

        await session.commitTransaction();
        session.endSession();
        res.status(200).json(sendSuccessResponse(200, 'Calendar has been deleted...'));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}


export const updateCalendar = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to update calendar', errors.array()));
    }

    const { id } = matchedData(req, { locations: ['params'] });
    const {title } = matchedData(req);

    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const calendar = await Calendar.findOne({ _id: id });

        if (!calendar) {
            throw errorHandler(404, 'Calendar not found when trying to update Calendar');
        }

        if (calendar.userID.toString() !== req.user.id) {
            throw errorHandler(403, 'Unauthorized Access when trying to update Calendar');
        }

        const updateResult = await Calendar.updateOne(
            { _id: id },
            { title },
            { session }
        );

        if (!updateResult.acknowledged || updateResult.modifiedCount !== 1 || updateResult.matchedCount !== 1) {
            throw errorHandler(500, 'Calendar update failed');
        }

        const updateResultUser = await User.updateOne(
            { _id: req.user.id, 'calendars._id': id },
            { $set: { 'calendars.$.title': title } },
            { session }
        );

        if (!updateResultUser.acknowledged || updateResultUser.modifiedCount !== 1 || updateResultUser.matchedCount !== 1) {
            throw errorHandler(500, 'An error occurred while updating the user\'s calendars section.');
        }

        await session.commitTransaction();
        session.endSession();
        res.status(200).json(sendSuccessResponse(200, 'Calendar has been updated...'));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}


export const createSubCalendar = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }

    const { id } = matchedData(req, { locations: ['params'] });
    const {  date } = matchedData(req);

    try {
        const calendar = await Calendar.findOne({ _id: id });

        if (!calendar) {
            throw errorHandler(404, 'Calendar not found');
        }

        const createdSubCalendar = await SubCalendar({ 
            date:date,
        });

        if (!createdSubCalendar) {
            throw errorHandler(500, 'SubCalendar creation failed');
        }

        // Tek nesneyi ekliyoruz
        calendar.calendars.push(createdSubCalendar);

        await calendar.save();

        res.status(201).json(sendSuccessResponse(201, 'SubCalendar created successfully', createdSubCalendar));
    } catch (error) {
        next(error);
    }
}

export const deleteSubCalendar = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }

    const { id, subId } = matchedData(req, { locations: ['params'] });

    try {
        const calendar = await Calendar.findOne({ _id: id });

        if (!calendar) {
            throw errorHandler(404, 'Calendar not found when trying to delete SubCalendar');
        }

        // Alt takvimi sil
        calendar.calendars.pull(subId);

        const updateResult = await calendar.save();

        if (!updateResult) {
            throw errorHandler(500, 'SubCalendar deletion failed');
        }

        res.status(200).json(sendSuccessResponse(200, 'SubCalendar deleted successfully'));
    } catch (error) {
        next(error);
    }
}


export const updateSubCalendar = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }

    const { id, subId } = matchedData(req, { locations: ['params'] });
    const { title, date, content, variables } = matchedData(req);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const calendar = await Calendar.findOne({ _id: id }).session(session);

        if (!calendar) {
            throw errorHandler(404, 'Calendar not found when trying to update SubCalendar');
        }

        const subCalendar = calendar.calendars.id(subId);

        if (!subCalendar) {
            throw errorHandler(404, 'SubCalendar not found when trying to update SubCalendar');
        }

        // Sadece gönderilen alanları güncelle
        if (title !== undefined) subCalendar.title = title;
        if (date !== undefined) subCalendar.date = date;
        if (content !== undefined) subCalendar.content = content;
        subCalendar.variables = variables;

        // Calendar'ın variables listesini güncelle
        const newVariables = Object.keys(variables);
        calendar.variables = newVariables;

        const updateResult = await calendar.save({ session });

        if (!updateResult) {
            throw errorHandler(500, 'SubCalendar update failed');
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json(sendSuccessResponse(200, 'SubCalendar updated successfully', subCalendar));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const getSubCalendar = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation failed', errors.array()));
    }

    const { id, subId } = matchedData(req, { locations: ['params'] });

    try {
        const calendar = await Calendar.findOne({ _id: id });

        if (!calendar) {
            throw errorHandler(404, 'Calendar not found when trying to fetch SubCalendar');
        }

        const subCalendar = calendar.calendars.id(subId);

        if (!subCalendar) {
            throw errorHandler(404, 'SubCalendar not found when trying to fetch SubCalendar');
        }

        res.status(200).json(sendSuccessResponse(200, 'SubCalendar fetched successfully', subCalendar));
    } catch (error) {
        next(error);
    }
}


export const getCalendarVariables = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, 'Validation fails when trying to get calendar', errors.array()));
    }
    const { id } = matchedData(req, { locations: ['params'] });

    try {
        const calendar = await Calendar.findOne({ _id: id });

        if (!calendar) {
            throw errorHandler(404, 'Calendar not found when trying to fetch Calendar');
        }

        if (calendar.userID.toString() !== req.user.id) {
            throw errorHandler(403, 'Unauthorized Access when trying to fetch Calendar');
        }

        const result = calendar.calendars
        .filter(subCalendar => subCalendar.variables && subCalendar.variables.size > 0)
        .map(subCalendar => ({
            date: subCalendar.date,
            variables: subCalendar.variables
        }));

        res.status(200).json(sendSuccessResponse(200, 'Calendar has been fetched...', result));
    } catch (error) {
        next(error);
    }
}