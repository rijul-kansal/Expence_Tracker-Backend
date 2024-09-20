const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const User = require('./Schema/UsersSchema');
const express = require('express');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const bookNameRouter = require('./Routes/BooknameRoutes');
const moneyTransRouter = require('./Routes/MoneyTransRoutes');
const UserRouter = require('./Routes/UserRoutes');
const paymentRouter = require('./Routes/PaymentRoute');
const ErrorMiddleware = require('./utils/ErrorMiddleware');
const AppError = require('./utils/AppError');
const functions = require('firebase-functions');
const FireBaseController = require('./Controller/FirebaseController');
const app = express();
const mongoose = require('mongoose');
var cron = require('node-cron');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
});

app.use(limiter);
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/bookname', bookNameRouter);
app.use('/api/v1/moneyTrans', moneyTransRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/Users', UserRouter);

app.all('*', (req, res, next) => {
  next(new AppError('This API is not valid. Please check your APIs', 400));
});

// Middleware to handle errors
app.use(ErrorMiddleware);

const DB = process.env.DATABASE_URL.replace('<password>', process.env.PASSWORD);

// Schedule cron job to run every 6 hours
cron.schedule('0 */6 * * *', async () => {
  try {
    const tokens = await User.find().select('FCM');
    let tok = tokens.map((el) => el.FCM);
    FireBaseController.sendingNotificationTomultipleDevice(
      tok,
      "Keep track of your spending. Don't forget to add your recent expenses to your expense book.",
      'Time to Log Your Expenses!',
      'https://firebasestorage.googleapis.com/v0/b/all-backend-fd5c7.appspot.com/o/UserImages%2Fdepositphotos_30214197-stock-illustration-dollar-cartoon.jpg?alt=media&token=e01becd7-5636-4a6f-bacb-58558592df4b'
    );
    console.log('Notifications sent');
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
});

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('Successfully connected to DB');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Exit process with failure
  });

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Uncomment for local server deployment
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Listening to server on port ${PORT}`);
});

// exports.api = functions.https.onRequest(app);
