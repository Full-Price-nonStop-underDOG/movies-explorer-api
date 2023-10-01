const express = require('express');
const { celebrate, Joi } = require('celebrate');

const {
  createMovie,
  deleteMovie,
  getCurrentUserMovies,
} = require('../controllers/movies');

const router = express.Router();

router.post(
  '/movies',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required(),
      trailerLink: Joi.string().required(),
      thumbnail: Joi.string().required(),
      owner: Joi.string(),
      movieId: Joi.number().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
      authorization: Joi.string(),
    }),
  }),
  createMovie,
);

router.delete(
  '/movies/:_id',
  celebrate({
    params: Joi.object().keys({
      _id: Joi.string(),
    }),
  }),
  deleteMovie,
);

router.get('/movies', getCurrentUserMovies);

module.exports = router;
