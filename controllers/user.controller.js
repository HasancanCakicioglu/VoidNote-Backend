import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import bcryptjs from 'bcryptjs';
import { validationResult,matchedData  } from 'express-validator';
import { sendSuccessResponse } from '../utils/success.js';



export const getUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errorHandler(400, 'Validation failed', errors.array()));
  }
  const { type } = matchedData(req);
  const user_id = req.user.id;

  try {
    let user = "";
    if (type === 'all') {
      user = await User
      .findOne({ _id: user_id }).select('-password')
    }else{
      user = await User
      .findOne({ _id: user_id }).select(type);
    }

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    res.status(200).json(sendSuccessResponse(200, 'User fetched successfully', user));

  } catch (error) {
    next(error);
  }
}


// update user

export const updateUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errorHandler(400, 'Validation failed', errors.array()));
  }

  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, 'You can update only your account!'));
  }
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          profilePhotoUrl: req.body.profilePicture,
          preferences: req.body.preferences,
          notes: req.body.notes,
          treeNotes: req.body.treeNotes,
          todos: req.body.todos,
          calendar: req.body.calendar,

        },
      },
      { new: true }
    );
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};


// delete user


export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, 'You can delete only your account!'));
  }
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json('User has been deleted...');
  } catch (error) {
    next(error);
  }

}