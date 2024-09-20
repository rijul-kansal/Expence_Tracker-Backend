const mongoose = require('mongoose');
var validatorr = require('validator');
var bcrypt = require('bcryptjs');
const { promisify } = require('util');

const Schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'A name should be there'],
    maxLength: [20, 'a name should of max length 20 characters'],
  },
  email: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        return validatorr.isEmail(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
    unique: true,
    required: [true, 'A email should be there'],
  },
  password: {
    type: String,
    trim: true,
    minLength: [8, 'Password length should be of 8 character minimum'],
    select: false,
    required: [true, 'A password should be there'],
  },
  Image: String,
  mobileNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  OTP: String,
  OTP_VALID_TILL: Number,
  PASSWORD_CHANGED_DATE: Number,
  FCM: {
    type: String,
  },
});

// encode the password
Schema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await promisify(bcrypt.genSalt)(10);
  console.log(salt);

  const newPass = await promisify(bcrypt.hash)(this.password, salt);

  this.password = newPass;
  next();
});

// true means password is changed later as compared to date given in the fn call
Schema.methods.CHECK_PASSWORD_CHANGE_DATE = function (date) {
  if (this.PASSWORD_CHANGED_DATE === undefined) {
    return false;
  } else {
    if (this.PASSWORD_CHANGED_DATE / 1000 > date) return true;
  }

  return false;
};
const User = mongoose.model('Users', Schema);

module.exports = User;
