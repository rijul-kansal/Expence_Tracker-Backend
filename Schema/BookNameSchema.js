const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a name field should be there'],
  },
  updatedLast: {
    type: Number,
    default: Date.now,
  },
  userId: {
    type: [String],
    required: [true, 'used id should be there '],
  },
  originalOwner: {
    type: String,
    required: [true, 'used id should be there '],
  },
});

const bookName = mongoose.model('BookName', schema);

module.exports = bookName;
