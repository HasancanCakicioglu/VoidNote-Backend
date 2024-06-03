import { errorHandler } from '../utils/error.js';
import { validationResult, matchedData } from 'express-validator';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { Calendar ,SubCalendar} from '../models/calendar.model.js';


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
        res.status(201).json({ message: 'calendar created successfully' ,data:calendar});
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

        res.status(200).json({ message: 'Calendar fetched successfully', data: calendar });
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
        res.status(200).json({ message: 'Calendar deleted successfully' });
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
        res.status(200).json({ message: 'Calendar updated successfully' });
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
    const { title, date } = matchedData(req);

    try {
        const calendar = await Calendar.findOne({ _id: id });

        if (!calendar) {
            throw errorHandler(404, 'Calendar not found');
        }

        const createdSubCalendar = await SubCalendar({ 
            title:title,
            date:date,
        });

        if (!createdSubCalendar) {
            throw errorHandler(500, 'SubCalendar creation failed');
        }

        // Tek nesneyi ekliyoruz
        calendar.notes.push(createdSubCalendar);

        await calendar.save();

        res.status(201).json({ message: 'SubCalendar created successfully', data: createdSubCalendar });
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
        calendar.notes.pull(subId);

        const updateResult = await calendar.save();

        if (!updateResult) {
            throw errorHandler(500, 'SubCalendar deletion failed');
        }

        res.status(200).json({ message: 'SubCalendar deleted successfully' });
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
    const { title, date, content, styleModel } = matchedData(req);

    try {
        const calendar = await Calendar.findOne({ _id: id });

        if (!calendar) {
            throw errorHandler(404, 'Calendar not found when trying to update SubCalendar');
        }

        const subCalendar = calendar.notes.id(subId);

        if (!subCalendar) {
            throw errorHandler(404, 'SubCalendar not found when trying to update SubCalendar');
        }

        // Sadece gönderilen alanları güncelle
        if (title !== undefined) subCalendar.title = title;
        if (date !== undefined) subCalendar.date = date;
        if (content !== undefined) subCalendar.content = content;
        if (styleModel !== undefined) subCalendar.style = styleModel;

        const updateResult = await calendar.save();

        if (!updateResult) {
            throw errorHandler(500, 'SubCalendar update failed');
        }

        res.status(200).json({ message: 'SubCalendar updated successfully' });
    } catch (error) {
        next(error);
    }
}