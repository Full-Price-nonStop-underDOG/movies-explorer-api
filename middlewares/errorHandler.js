// errorHandler.js

const TokenInvalidError = require('../errors/tokenInvalidError');

module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message =
    statusCode === 500
      ? `На сервере произошла ошибка: ${err.message}`
      : err.message;

  if (err instanceof TokenInvalidError && err.isTokenInvalid) {
    // Токен невалиден, выполните логику логаута
    res.clearCookie('token');
    statusCode = 401; // Устанавливаем статус 401 Unauthorized
    message = 'Token is invalid';
  }

  res.status(statusCode).json({ message });
};
