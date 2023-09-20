const jwt = require('jsonwebtoken');

const TokenInvalidError = require('../errors/tokenInvalidError');

const jwtSecret = process.env.NODE_ENV === 'production'
  ? process.env.JWT_SECRET
  : 'my_darling_is_over_the_ocean';

module.exports = (req, res, next) => {
  const { token: cookieToken } = req.cookies;

  if (!cookieToken) {
    return next(new TokenInvalidError('BearerToken not found'));
  }

  let payload;

  try {
    payload = jwt.verify(cookieToken, jwtSecret);
  } catch (err) {
    return next(new TokenInvalidError('Необходима авторизация'));
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  return next(); // пропускаем запрос дальше
};
