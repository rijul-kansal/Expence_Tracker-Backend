const MoneyTrans = require('../Schema/MoneyTransSchema');
const BookName = require('../Schema/BookNameSchema');
const AppError = require('../utils/AppError');
const generalFn = require('../utils/Generalfn');

// advanced filtering based on categories like same item like chocklate etc
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

const addTrans = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const email = req.user.email;
    const book = await BookName.findById(bookId);

    if (!book) {
      return next(new AppError('a book with this id does not exists ', 404));
    }
    if (!book.userId.includes(email)) {
      return next(
        new AppError(
          'you are not the part for this book . please check book id once',
          401
        )
      );
    }
    const { amount, description, moneyType, category } = req.body;
    const data = await MoneyTrans.create({
      amount,
      description,
      moneyType,
      bookId,
      addedBy: email,
      category,
    });
    const response = {
      status: 'success',
      data: {
        data,
      },
    };
    res.status(201).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};

const deleteTransById = async (req, res, next) => {
  try {
    const transId = req.params.id;
    const email = req.user.email;
    const trans = await MoneyTrans.findById(transId);

    if (!trans) {
      return next(
        new AppError('No transaction exists with the given ids', 404)
      );
    }

    if (trans.addedBy != email) {
      return next(
        new AppError(
          'you have not created this entry so you will not able to delete this entry',
          404
        )
      );
    }
    await MoneyTrans.findByIdAndDelete(req.params.id);
    const response = {
      status: 'success',
      data: null,
    };
    res.status(204).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};

const getTransForParticularBook = async (req, res, next) => {
  try {
    const email = req.user.email;
    const bookId = req.params.id;
    const book = await BookName.findById(bookId);

    if (!book) {
      return next(new AppError('A book with this id does not exists', 404));
    }

    if (!book.userId.includes(email)) {
      return next(new AppError(' You are not part of this book anymore', 404));
    }

    const data = await MoneyTrans.find({ bookId }).sort({ addedAt: -1 });
    const totalBalance = await MoneyTrans.aggregate([
      {
        $match: { bookId },
      },
      {
        $group: {
          _id: '$moneyType',
          amount: { $sum: '$amount' },
        },
      },
      {
        $addFields: { type: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);

    const responce = {
      status: 'success',
      length: data.length,
      totalBalance,
      data: {
        data,
      },
    };
    res.status(201).json(responce);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};

const filterMoneyTransForParticularBook = async (req, res, next) => {
  try {
    const email = req.user.email;
    const bookId = req.params.id;
    const book = await BookName.findById(bookId);

    if (!book) {
      return next(new AppError('A book with this id does not exists', 404));
    }
    if (!book.userId.includes(email)) {
      return next(new AppError(' You are not part of this book anymore', 404));
    }

    const { date, type, members, category } = req.query;
    let moneyType = [];
    let dates = [];
    if (!date) {
      dates.push(1672593860000);
      dates.push(parseInt(Date.now()));
    } else {
      const datee = date.split(',');
      if (datee.length === 1) {
        const d = generalFn.convertInAmPm(datee[0] * 1); // in miliseconds
        dates.push(d[0]);
        dates.push(d[1]);
      } else {
        const d1 = generalFn.convertInAmPm(datee[0] * 1);
        const d2 = generalFn.convertInAmPm(datee[1] * 1);
        dates.push(d1[0]);
        dates.push(d2[1]);
      }
    }

    if (!type) {
      moneyType.push('In');
      moneyType.push('Out');
    } else {
      const typee = type.split(',');
      typee.map((el) => moneyType.push(el));
    }
    const condition = [
      { bookId: bookId },
      { addedAt: { $gte: dates[0] } },
      { addedAt: { $lte: dates[1] } },
      { moneyType: { $in: moneyType } },
    ];
    let data;
    if (members) {
      const member = members.split(',');

      for (let i = 0; i < member.length; i++) {
        const e = member[i];
        if (!book.userId.includes(e)) {
          return next(
            new AppError(
              `Member with email id ${e} is not the part of this book`,
              404
            )
          );
        }
      }
      condition.push({ addedBy: { $in: member } });
    }
    if (category) {
      const cat = category.split(',');
      condition.push({ category: { $in: cat } });
    }
    data = await MoneyTrans.aggregate([
      {
        $match: {
          $and: condition,
        },
      },
      {
        $sort: { addedAt: -1 },
      },
    ]);
    const responce = {
      status: 'success',
      length: data.length,
      data: {
        data,
      },
    };
    res.status(201).json(responce);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};

const updateTrans = async (req, res, next) => {
  try {
    const email = req.user.email;
    const trans = req.params.id;

    const transRec = await MoneyTrans.findById(trans);
    const { amount, description, category } = req.body;

    if (!amount && !description && !category) {
      return next(
        new AppError(
          'Either add amount or description or category in order to update entry',
          403
        )
      );
    }
    if (!transRec) {
      return next(new AppError('No Trans find with this id', 404));
    }

    if (transRec.addedBy !== email) {
      return next(
        new AppError(
          'As you have not created this entry so you can not modify this entry',
          404
        )
      );
    }

    const transs = await MoneyTrans.findByIdAndUpdate(
      trans,
      { amount, description, category },
      {
        new: true,
        runValidators: true,
      }
    );

    const response = {
      status: 'success',
      data: {
        data: transs,
      },
    };

    res.status(201).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};

const downloadTrans = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const tasks = await MoneyTrans.find({ bookId });
    if (tasks.length > 0) {
      const xlsBuffer = await generalFn.generateXLS(tasks);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');
      res.send(xlsBuffer);
    } else {
      return next(new AppError('No Trans found with this book', 404));
    }
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};

const transBasedOnCategory = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const data = await MoneyTrans.aggregate([
      {
        $match: {
          bookId,
        },
      },
      {
        $group: {
          _id: '$category',
          amountIn: {
            $sum: {
              $cond: {
                if: { $eq: ['$moneyType', 'In'] },
                then: '$amount',
                else: 0,
              },
            },
          },
          amountOut: {
            $sum: {
              $cond: {
                if: { $eq: ['$moneyType', 'Out'] },
                then: '$amount',
                else: 0,
              },
            },
          },
        },
      },
    ]);
    const response = {
      status: 'success',
      data: {
        data,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    generalFn.errorMessage(err, 400, res, next);
  }
};
module.exports = {
  addTrans,
  deleteTransById,
  getTransForParticularBook,
  filterMoneyTransForParticularBook,
  updateTrans,
  downloadTrans,
  transBasedOnCategory,
};
