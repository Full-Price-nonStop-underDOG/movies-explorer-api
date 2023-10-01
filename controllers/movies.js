const jwt = require('jsonwebtoken');
const Movie = require('../models/movie');

const NoDataError = require('../errors/noDataError');
const InvalidRequst = require('../errors/invalidRequestError');

module.exports.getToken = (req) => {
  const { token: cookieToken } = req.cookies;

  return cookieToken;
};
module.exports.getCurrentUserMovies = (req, res, next) => {
  const payload = jwt.decode(this.getToken(req));
  Movie.find({ owner: payload._id }) // Фильтрация фильмовпо owner
    .then((movies) => {
      res.json(movies);
    })
    .catch((error) => next(error));
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  const payload = jwt.decode(this.getToken(req));

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: payload._id,
  })
    .then((card) => res.status(201).send(card))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return next(
          new InvalidRequst(
            'Переданы некорректные данные при создании карточки',
          ),
        );
      }
      return next(error);
    });
};

module.exports.deleteMovie = async (req, res, next) => {
  const { _id } = req.params;
  const payload = jwt.decode(this.getToken(req));
  try {
    const movie = await Movie.findById(_id);

    if (!movie) {
      return next(new NoDataError('Card not found'));
    }
    if (String(movie.owner) !== String(payload._id)) {
      // Check if the requesting user is the owner of the movie
      return res
        .status(403)
        .json('You do not have permission to delete this movie');
    }

    await Movie.findByIdAndDelete(_id);

    return res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new InvalidRequst('Wrong movie id'));
    }
    return next(error);
  }
};
