const AppError = require('./../utils/AppError');
const PayU = require('payu-websdk');
const Payment = require('./../Schema/PaymentSchema');

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

const payuClient = new PayU(
  {
    key: process.env.MERCHANTID,
    salt: process.env.SALT,
  },
  'TEST'
);

const getKeys = (req, res, next) => {
  try {
    const amount = req.params.amt;
    const transId = 'paymentForTest-' + Date.now();
    const { email, name, mobileNumber } = req.user;
    const firstName = name.split(' ')[0];
    const key = process.env.MERCHANTID;
    const salt = process.env.SALT;
    const response = {
      status: 'success',
      data: {
        amount,
        salt,
        key,
        mobileNumber,
        transId,
        firstName,
        email,
        UserCred: `${key}:${mobileNumber}`,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};

const validDate = (amt, date) => {
  return date + 31536060000;
};

const addDataToDb = async (req, res, next) => {
  try {
    const { transId } = req.body;
    const email = req.user.email;

    if (!transId) {
      return next(new AppError('Please enter all parameters', 400));
    }

    const verify = await payuClient.verifyPayment(transId);
    if (verify.status === 1) {
      const oldEntry = await Payment.find({ transId });
      if (oldEntry.length == 0) {
        const amt =
          verify.transaction_details[`${transId}`].amt.split('.')[0] * 1;
        const date = transId.split('-')[1] * 1;
        await Payment.create({
          amount: amt,
          date: date,
          userEmail: email,
          transId,
          validTill: validDate(amt, date),
        });

        const response = {
          status: 'success',
          message: 'successfully stored in database',
        };
        res.status(201).json(response);
      } else {
        return next(new AppError('Trans Id is already exists', 400));
      }
    } else {
      return next(new AppError('Please check your transId', 400));
    }
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};

const history = async (req, res, next) => {
  try {
    const email = req.user.email;

    const history = await Payment.find({ userEmail: email })
      .select('amount date validTill')
      .sort('-date');
    const response = {
      status: 'success',
      data: {
        history,
      },
    };

    res.status(201).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};
module.exports = {
  getKeys,
  addDataToDb,
  history,
};
