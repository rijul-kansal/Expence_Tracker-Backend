const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'amount should be there'],
  },
  date: {
    type: Number,
    required: [true, 'Date of payment should be there'],
  },
  userEmail: {
    type: String,
    required: [true, 'A user id should be there'],
  },
  transId: {
    type: String,
    required: [true, 'A trans id should be there'],
  },
  validTill: {
    type: Number,
    required: [true, 'valid date should be there'],
  },
});

const PaymentSchema = mongoose.model('Payment', schema);

module.exports = PaymentSchema;
