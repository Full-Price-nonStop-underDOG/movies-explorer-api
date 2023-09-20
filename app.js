const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { celebrate, Joi, errors } = require('celebrate');
const cookieParser = require('cookie-parser');

const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');
const authMiddleware = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./logger');
const { login, createUser } = require('./controllers/users');

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
  }),
);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/bitfilmsdb', {
  useNewUrlParser: true,
});

app.listen(3001, () => {});

app.use((req, res, next) => {
  if (req.url === '/signup' || req.url === '/signin') {
    next(); // Skip auth for signup and signin
  } else {
    authMiddleware(req, res, next); // Appply authMiddleware for other route
  }
});

app.use(requestLogger);
app.use(userRouter);
app.use(movieRouter);

userRouter.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6),
    }),
  }),
  login,
);

userRouter.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6),
      name: Joi.string().min(2).max(30),
    }),
  }),
  createUser,
);

app.use(errorLogger);
app.use(errors());

app.use('*', (req, res, next) => {
  const err = new Error('Not Found');
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => {
  // этот next обязательно оставлять, мне сказал так преподователь)
  // без него ломаются ошибки, потому что без next app.use перестает быть мидлваром
  // Отправляем ошибку клиенту

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500
    ? `На сервере произошла ошибка: ${err.message}`
    : err.message;

  res.status(statusCode).json({ message });
});
