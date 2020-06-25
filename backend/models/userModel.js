const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Usermodel = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  mail: {
    type: String,
    required: true,
  },
  currentOtp: {
    type: String,
    required: true,
  },
  otpCount: {
    type: Number,
    required: true,
  },
  seminars: {
    type: Array,
    required: true,
  },
  secret: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
});

Usermodel.methods.generateAuthToken = function (authedTOTP) {
  const token = jwt.sign(
    {
      _id: this._id, name: this.userName, isAdmin: this.isAdmin, authedTOTP,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '2d' },
  );
  return token;
};

module.exports = mongoose.model('User', Usermodel);
