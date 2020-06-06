const mongoose = require('mongoose');


const Usermodel = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  currentOtp: {
    type: Number,
    required: true,
  },
  otpCount: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('User', Usermodel);
