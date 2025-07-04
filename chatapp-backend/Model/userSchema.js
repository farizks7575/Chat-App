const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  dateOfRegister: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
