const BookName = require('../Schema/BookNameSchema');
const MoneyTrans = require('../Schema/MoneyTransSchema');
const User = require('../Schema/UsersSchema');
const AppError = require('../utils/AppError');

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
const createBook = async (req, res, next) => {
  try {
    const name = req.body.name;
    const userId = [req.user.email];
    const originalOwner = req.user.email;
    const data = await BookName.create({ name, userId, originalOwner });
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
const updateBook = async (req, res, next) => {
  try {
    let name = req.body.name;
    let newUserId = req.body.newUserId;
    let removeUser = req.body.removeUser;
    if (!name && !newUserId && !removeUser) {
      return next(
        new AppError(
          'Atleast enter one parameter either name or newUserId or removeUser',
          403
        )
      );
    }
    const bookId = req.params.id;
    const email = req.user.email;

    const bookDetails = await BookName.findOne({ _id: bookId });
    if (!bookDetails) {
      return next(
        new AppError('No book exists with the id please check id again', 403)
      );
    }
    let user;
    if (newUserId) {
      user = await User.findOne({ email: newUserId });
      if (!user) {
        return next(
          new AppError(
            'The user you wish to add is not there. Please ask user to register on platform or check email address'
          )
        );
      }
    }

    name = name || bookDetails.name;
    const updatedLast = Date.now();
    let bookIds = bookDetails.userId;
    if (newUserId || removeUser) {
      if (email === bookDetails.originalOwner) {
        if (newUserId) {
          if (bookIds.includes(newUserId)) {
            return next(
              new AppError(
                `the person with this ${newUserId} is already included`,
                403
              )
            );
          }
          if (!user.emailVerified) {
            return next(
              new AppError(
                `the person with this ${newUserId} is not verified`,
                403
              )
            );
          }

          bookIds.push(newUserId);
        } else {
          for (let i = 0; i < removeUser.length; i++) {
            const ele = removeUser[i];
            for (let j = 0; j < bookIds.length; j++) {
              if (bookIds[j] === ele) {
                bookIds.splice(j, 1);
                break;
              }
            }
          }
          if (bookIds.length === 0) {
            return next(
              new AppError(
                'You are trying to remove all the members so please directly delete book'
              )
            );
          }

          if (!bookIds.includes(bookDetails.originalOwner)) {
            return next(
              new AppError(
                'You are trying to remove yourself insterd of this please directly delete book'
              )
            );
          }
        }
      } else {
        return next(
          new AppError('Only owner of the book can add or delete members')
        );
      }
    }
    const data = await BookName.findByIdAndUpdate(
      { _id: bookId },
      {
        name,
        userId: bookIds,
        updatedLast,
      },
      {
        runValidators: true,
        new: true,
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
const deleteBook = async (req, res, next) => {
  try {
    const email = req.user.email;
    const bookId = req.params.id;
    const book = await BookName.findById(bookId);
    if (!book) {
      return next(new AppError('Book with this id does not exists', 401));
    }

    if (book.originalOwner === email) {
      await MoneyTrans.deleteMany({ bookId });
      await BookName.findByIdAndDelete(bookId);
    } else {
      return next(
        new AppError('Only owner of the book can delete this book', 404)
      );
    }
    res.status(200).json({
      status: 'success',
      message: 'successfully deleted',
    });
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};
const getBookOfParticularUser = async (req, res, next) => {
  try {
    const userIdd = req.user.email;
    const d = await BookName.find({ userId: { $in: [userIdd] } });
    if (d.length === 0) {
      return next(new AppError('a user has not created any book', 401));
    }
    const response = {
      status: 'success',
      data: {
        data: d,
      },
    };
    res.status(200).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};
module.exports = {
  createBook,
  updateBook,
  deleteBook,
  getBookOfParticularUser,
};
