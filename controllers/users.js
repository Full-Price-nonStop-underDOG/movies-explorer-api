const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const InvalidRequst = require('../errors/invalidRequestError');
const NoDataError = require('../errors/noDataError');
const ServerConflictError = require('../errors/serverConflictError');
const TokenInvalidError = require('../errors/tokenInvalidError');

const jwtSecret = process.env.NODE_ENV === 'production'
  ? process.env.JWT_SECRET
  : 'my_darling_is_over_the_ocean';

module.exports.getToken = (req) => {
  const { token: cookieToken } = req.cookies;

  return cookieToken;
};

module.exports.getCurrentUser = async (req, res, next) => {
  try {
    const payload = jwt.decode(this.getToken(req));

    // Fetch the current user information from req.user (provided by the auth middleware)
    const currentUser = await User.findById(payload._id);

    if (!currentUser) {
      return next(new NoDataError('User not found'));
    }

    // Return the user information in the response
    return res.status(200).json(currentUser);
  } catch (error) {
    return next(error);
  }
};

module.exports.updateProfile = (req, res, next) => {
  const { name, email } = req.body;

  const payload = jwt.decode(this.getToken(req));

  User.findByIdAndUpdate(
    payload._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        throw new NoDataError('User not found');
      }
      return res.status(200).json(updatedUser);
    })
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        return next(
          new InvalidRequst(
            'Переданы некорректные данные при обновлении профиля',
          ),
        );
      }
      return next(error);
    });
};

module.exports.createUser = (req, res, next) => {
  const { email, password, name } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => {
      const { _id } = user;

      return res.status(201).send({
        email,
        name,
        _id,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(
          new ServerConflictError(
            'Пользователь с таким электронным адресом уже существует',
          ),
        );
      } else if (err.name === 'ValidationError') {
        // В случае ошибки валидации отправляем ошибку 400
        next(new InvalidRequst('Переданы некорректные данные при регистрации'));
      } else {
        next(err);
      }
    });
};

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check if the user with the given email exists in the database
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new TokenInvalidError('Invalid email or password'));
    }

    const payload = { _id: user._id };
    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }); // 7 days

    return res.json({ _id: user._id, token });
  } catch (error) {
    return next(error);
  }
};

module.exports.signout = (req, res) => {
  // Очистите куку с токеном
  res.clearCookie('token');
  res.status(200).json({ message: 'Signout successful' });
};
