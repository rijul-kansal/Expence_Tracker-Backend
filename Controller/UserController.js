const AppError = require('../utils/AppError');
const User = require('./../Schema/UsersSchema');
const errorMessage = (err, statusCode, res, next) => {
  if (process.env.DEV_ENV === 'Development') {
    const response = {
      status: err.status || 'fail',
      message: err.message,
      err,
      errStack: err.stack,
    };
    res.status(statusCode).json(response);
  } else {
    return next(new AppError(err.message, statusCode));
  }
};
const getUser = async (req, res, next) => {
  try {
    const email = req.user.email;

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('No user exists for this token', 401));
    }
    const response = {
      status: 'success',
      data: {
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        Id: user._id,
        Image: user.Image,
      },
    };

    res.status(201).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { name, mobileNumber, fcmToken, imageUrl } = req.body;
    if (!name && !mobileNumber && !fcmToken && !imageUrl) {
      return next(new AppError('please enter atleast one parameter', 400));
    }
    const data = await User.findOneAndUpdate(
      { email: req.user.email },
      {
        name,
        mobileNumber,
        FCM: fcmToken,
        Image: imageUrl,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    const response = {
      status: 'success',
      data: {
        data,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};
module.exports = {
  getUser,
  updateMe,
};
