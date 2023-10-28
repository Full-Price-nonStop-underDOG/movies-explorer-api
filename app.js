const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { celebrate, Joi, errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan'); // Подключаем morgan

const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');
const authMiddleware = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./logger');
const { login, createUser } = require('./controllers/users');
const errorHandler = require('./middlewares/errorHandler');
const limiter = require('./middlewares/rateLimiter');

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'PULL'],
  })
);

app.use(helmet());
app.disable('x-powered-by');
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bitfilmsdb',
  {
    useNewUrlParser: true,
  }
);

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
app.use(morgan('dev'));

userRouter.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6),
    }),
  }),
  login
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
  createUser
);

app.use(limiter);
app.use(errorLogger);
app.use(errors());

app.use('*', (req, res, next) => {
  const err = new Error('Not Found');
  err.statusCode = 404;
  next(err);
});

app.use(errorHandler);
