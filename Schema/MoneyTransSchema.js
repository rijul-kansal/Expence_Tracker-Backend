const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'amount should be there'],
  },
  addedAt: {
    type: Number,
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  moneyType: {
    type: String,
    required: [true, 'type should be there'],
    enum: {
      values: ['In', 'Out'],
      message: '{VALUE} is not supported. only In or Out can be inserted',
    },
  },
  bookId: {
    type: String,
    required: [true, 'book id should be there'],
  },
  addedBy: {
    type: String,
    required: [true, 'please attach user id also'],
  },
  category: {
    type: String,
  },
});

const moneytrans = mongoose.model('Money-Transaction', schema);

module.exports = moneytrans;
