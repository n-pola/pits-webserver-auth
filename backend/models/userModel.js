const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Usermodel = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  currentOtp: {
    type: Number,
    required: true
  },
  otpCount: {
    type: Number,
    required: true
  },
  seminars: {
    type: Array,
    required: true
  }
});

Usermodel.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, name: this.userName },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '2d' }
  );
  return token;
};

module.exports = mongoose.model('User', Usermodel);
