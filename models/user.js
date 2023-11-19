const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Устанавливаем, что email должен быть уникальным
    validate: {
      validator: (value) => validator.isEmail(value),
      message: 'Некорректный формат email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  savedMovies: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
});

module.exports = mongoose.model('user', userSchema);
