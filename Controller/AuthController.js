const crypto = require('crypto');
const { promisify } = require('util');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const Users = require('../Schema/UsersSchema');
const AppError = require('../utils/AppError');
const SendEmail = require('./../utils/Email');
const Message = require('./../utils/Messages');

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
async function generate6digitOtp() {
  const otp = await promisify(crypto.randomInt)(100000, 999999);
  return otp;
}
const verifyPassword = async (notHashedPass, hashedPass) => {
  const response = await promisify(bcrypt.compare)(notHashedPass, hashedPass);
  return response;
};
const signUp = async (req, res, next) => {
  try {
    let { name, email, password, mobileNumber } = req.body;
    const otp = await generate6digitOtp();
    const data = await Users.create({
      name,
      email,
      password,
      mobileNumber,
      OTP: otp,
      OTP_VALID_TILL: Date.now() + 5 * 60 * 1000,
    });
    data.password = undefined;
    data.OTP = undefined;
    data.OTP_VALID_TILL = undefined;
    data.emailVerified = undefined;
    try {
      // sending welcome email
      SendEmail(
        data.email,
        'Welcome Message from Expence_Tracker App',
        Message.welcomeMessage(data.name)
      );
      // sending mail for otp
      await SendEmail(
        data.email,
        'Please verify your email address',
        Message.OTPMessage(data.name, otp)
      );
    } catch (err) {
      data.OTP = undefined;
      data.OTP_VALID_TILL = undefined;
      data.save();
      throw new Error(err.message);
    }

    const response = {
      status: 'success',
      message: 'Email has been send please verify your email id',
      data: {
        data,
      },
    };
    res.status(201).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};
const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return next(new AppError('Please enter email or otp', 401));
    }
    const user = await Users.find({
      email,
      OTP: otp,
    });
    if (user.length === 0) {
      return next(new AppError('Please check your email address or otp', 401));
    }

    const time = Date.now();
    if (user[0].OTP_VALID_TILL < time) {
      const otp = await generate6digitOtp();
      await SendEmail(
        user[0].email,
        'Please Verify your Email',
        Message.OTPMessage(user[0].name, otp)
      );

      await Users.findByIdAndUpdate(user[0]._id, {
        OTP: otp,
        OTP_VALID_TILL: Date.now() + 5 * 60 * 1000,
      });

      return next(
        new AppError(
          'OTP Expired. New OTP Send to youe registered email address'
        )
      );
    }
    await Users.findByIdAndUpdate(user[0]._id, {
      emailVerified: true,
      $unset: {
        OTP_VALID_TILL: '',
        OTP: '',
      },
    });

    const response = {
      status: 'success',
      message: 'user verified successfully please login ',
    };

    res.status(200).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please enter email or password', 403));
    }

    const user = await Users.find({ email }).select('+password');
    if (
      user.length === 0 ||
      !(await verifyPassword(password, user[0].password))
    ) {
      return next(new AppError('email or password is wrong', 401));
    }

    if (!user[0].emailVerified) {
      const otpp = await generate6digitOtp();
      await SendEmail(
        user[0].email,
        'Here its your OTP for Verify your Email',
        Message.OTPMessage(user[0].name, otpp)
      );
      user[0].OTP = otpp;
      user[0].OTP_VALID_TILL = Date.now() + 5 * 1000 * 60;
      user[0].save();
      return next(
        new AppError(
          'Please verify your email first . OTP send to your registered email id '
        )
      );
    }
    var token = await promisify(jwt.sign)(
      { id: user[0].email },
      process.env.JWT_KEY,
      {
        expiresIn: '10d',
      }
    );
    user[0].password = undefined;
    user[0].emailVerified = undefined;
    user[0].PASSWORD_CHANGED_DATE = undefined;
    const response = {
      status: 'success',
      message: 'successfully login',
      token,
      data: {
        data: user,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};
const protectedEndPoint = async (req, res, next) => {
  try {
    let token;

    if (!req.headers || !req.headers.authorization) {
      return next(new AppError('Please pass Token in headers', 401));
    }

    token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return next(new AppError('Please pass Token in headers', 401));
    }
    let tokenVerification;
    try {
      tokenVerification = await promisify(jwt.verify)(
        token,
        process.env.JWT_KEY
      );
    } catch (err) {
      console.log(err.message);
      if (
        err.message === 'invalid token' ||
        err.message === 'invalid signature'
      ) {
        return next(
          new AppError('Token is invalid or expired . Please login again ', 403)
        );
      }
    }
    const email = tokenVerification.id;
    const user = await Users.findOne({ email }).select('+password');
    if (!user || !user.emailVerified) {
      return next(
        new AppError('User is not there or account is not verified', 403)
      );
    }
    if (user.CHECK_PASSWORD_CHANGE_DATE(tokenVerification.iat)) {
      return next(
        new AppError('Pleaase login again as you have changed password', 403)
      );
    }
    req.user = user;
    next();
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};
const updatePassword = async (req, res, next) => {
  try {
    const { newPassword, oldPassword } = req.body;

    if (!newPassword || !oldPassword) {
      return next(
        new AppError('Please enter new password or old password ', 401)
      );
    }
    const user = req.user;
    if (!(await verifyPassword(oldPassword, user.password))) {
      return next(
        new AppError('Current password is wrong please check again', 401)
      );
    }

    user.password = newPassword;
    user.PASSWORD_CHANGED_DATE = Date.now();
    await user.save();
    user.password = undefined;
    user.PASSWORD_CHANGED_DATE = undefined;
    const response = {
      status: 'success',
      data: {
        data: user,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};
const resendVerificationCode = async (req, res, next) => {
  try {
    const email = req.body.email;
    if (!email) return next(new AppError('Please enter your email id'));

    const user = await Users.findOne({ email }).select('+password');
    if (!user) return next(new AppError('Please enter correct email address'));
    const otp = await generate6digitOtp();

    try {
      await SendEmail(
        user.email,
        'OTP Resend Mail',
        Message.OTPMessage(user.name, otp)
      );
    } catch (err) {
      return next(new AppError(err.message, 401));
    }

    user.OTP = otp;
    user.OTP_VALID_TILL = Date.now() + 5 * 60 * 1000;
    await user.save();

    const response = {
      status: 'success',
      message: 'OTP send to registered email address',
    };
    res.status(200).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};
const forgottenPassword = async (req, res, next) => {
  try {
    const email = req.body.email;

    if (!email) return next(new AppError('Please enter email address', 404));

    const user = await Users.findOne({ email }).select('+password');

    if (!user) {
      return next(
        new AppError(
          'User does not exists or entered incorrect email address',
          404
        )
      );
    }

    const otp = await generate6digitOtp();
    try {
      await SendEmail(
        user.email,
        'Here is your Otp',
        Message.OTPMessageForForgottenPassword(user.name, otp)
      );
    } catch (err) {
      return next(new AppError(err.message, 400));
    }
    user.OTP = otp;
    user.OTP_VALID_TILL = Date.now() + 5 * 1000 * 60;
    await user.save();

    const response = {
      status: 'success',
      message: 'OTP has beed send on then registered email',
    };
    res.status(202).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!otp || !newPassword || !email) {
      return next(new AppError('Please enter required parameters', 404));
    }

    const user = await Users.findOne({ email: email, OTP: otp }).select(
      '+password'
    );

    if (!user) {
      return next(
        new AppError('Either user does not exists or OTP is wrong', 404)
      );
    }

    const time = Date.now();

    if (time > user.OTP_VALID_TILL) {
      const otpp = await generate6digitOtp();
      user.OTP = otpp;
      user.OTP_VALID_TILL = Date.now() + 5 * 1000 * 60;
      await user.save();
      await SendEmail(
        user.email,
        'OTP for Change Password',
        Message.OTPMessageForForgottenPassword(user.name, otpp)
      );

      return next(
        new AppError(
          'Your old OTP has been expired . Please enter new OTP that has been send on your email Id',
          400
        )
      );
    }

    user.password = newPassword;
    user.OTP = undefined;
    user.OTP_VALID_TILL = undefined;

    await user.save();

    user.password = undefined;

    const response = {
      status: 'success',
      message: 'Password change Successfully',
    };

    res.status(200).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};
module.exports = {
  signUp,
  verifyEmail,
  login,
  protectedEndPoint,
  updatePassword,
  resendVerificationCode,
  forgottenPassword,
  resetPassword,
};
