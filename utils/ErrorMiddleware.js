const developmentEnv = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const productionEnv = (res, err) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const errorModificationForUser = (err) => {
  console.log(err.message);

  let message = err.message;
  if (message.startsWith('Users validation failed:')) {
    message = message.replace('Users validation failed:', '.');
    err.message = message.substr(2);
  }
  if (message.startsWith('E11000 duplicate key error collection:')) {
    const sp = message.split(':');
    const ele = sp[sp.length - 2].split(' ')[2];
    err.message = `This ${ele} is already exists. Please use another ${ele}`;
  }
};

const errorModificationForBook = (err) => {
  console.log(err.message);

  let message = err.message;
  if (message.startsWith('BookName validation failed:')) {
    message = message.replace('Users validation failed:', '.');
    err.message = message.substr(2);
  }
  if (message.startsWith('okName validation failed:')) {
    message = message.replace('okName validation failed:', '.');
    err.message = message.substr(2);
  }
  if (message.startsWith('E11000 duplicate key error collection:')) {
    const sp = message.split(':');
    const ele = sp[sp.length - 2].split(' ')[2];
    err.message = `This ${ele} is already exists. Please use another ${ele}`;
  }
};

const ErrorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.DEV_ENV === 'Development') {
    developmentEnv(res, err);
  } else {
    errorModificationForUser(err);
    errorModificationForBook(err);
    productionEnv(res, err);
  }
};

module.exports = ErrorMiddleware;
