// errorHandler.js

module.exports = (err, req, res, next) => {
  // Отправляем ошибку клиенту
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500
    ? `На сервере произошла ошибка: ${err.message}`
    : err.message;

  res.status(statusCode).json({ message });
};
