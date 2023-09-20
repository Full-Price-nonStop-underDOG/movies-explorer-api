const express = require('express');
const { celebrate, Joi } = require('celebrate');

const {
  getCurrentUser,
  updateProfile,
  signout,
} = require('../controllers/users');

const router = express.Router();

router.get('/users/me', getCurrentUser);
router.post('/signout', signout);

router.patch(
  '/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      email: Joi.string().min(2).max(30),
      authorization: Joi.string(),
    }),
  }),
  updateProfile,
);

module.exports = router;
