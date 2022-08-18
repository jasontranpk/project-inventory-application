const { body, validationResult } = require('express-validator');
const async = require('async');

const Movie = require('../models/movie');
const Genre = require('../models/genre');

exports.index = (req, res) => {
	Movie.find()
		.sort({ title: 1 })
		.exec(function (err, list_movie) {
			if (err) {
				return next(err);
			}
			res.render('movie_list', {
				title: 'Movie List',
				movie_list: list_movie,
			});
		});
};

exports.detail = (req, res, next) => {
	Movie.findById(req.params.id)
		.populate('genre')
		.exec((err, movie) => {
			if (err) {
				return next(err);
			}
			res.render('movie_detail', {
				title: movie.title,
				movie: movie,
			});
		});
};

exports.newGet = (req, res, next) => {
	Genre.find().exec((err, genreList) => {
		if (err) {
			return next(err);
		}

		res.render('movie_form', {
			title: 'New Movie',
			genres: genreList,
		});
	});
};
exports.newPost = [
	body('title')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('title must be specified'),
	body('description')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('title must be specified'),
	body('price')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('title must be specified'),
	body('number_in_stock')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('title must be specified'),
	body('genre.*').escape(),
	(req, res, next) => {
		const errors = validationResult(req);
		const movie = new Movie({
			title: req.body.title,
			description: req.body.description,
			price: req.body.price,
			number_in_stock: req.body.number_in_stock,
			genre: req.body.genre,
		});
		if (!errors.isEmpty()) {
			Genre.find().exec((err, genres) => {
				for (const genre of genres) {
					if (movie.genre.includes(genre._id)) genre.checked = 'true';
				}
				res.render('movie_form', {
					title: 'New Movie',
					movie: movie,
					genres: genres,
					errors: errors.array(),
				});
				return;
			});
		}
		movie.save((err) => {
			if (err) {
				return next(err);
			}
			res.redirect(movie.url);
		});
	},
];

exports.updateGet = (req, res, next) => {
	async.parallel(
		{
			movie(callback) {
				Movie.findById(req.params.id).populate('genre').exec(callback);
			},
			genres(callback) {
				Genre.find(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.movie == null) {
				const err = new Error('Movie Not Found');
				err.status = 404;
				return next(err);
			}
			for (const genre of results.genres) {
				for (const movieGenre of results.movie.genre) {
					if (genre._id.toString() === movieGenre._id.toString()) {
						genre.checked = 'true';
					}
				}
			}
			res.render('movie_form', {
				title: 'New Movie',
				movie: results.movie,
				genres: results.genres,
			});
		}
	);
};
exports.updatePost = [
	(req, res, next) => {
		if (!Array.isArray(req.body.genre)) {
			req.body.genre =
				typeof req.body.genre === 'undefined' ? [] : [req.body.genre];
		}
		next();
	},
	body('title')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('title must be specified'),
	body('description')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('description must be specified'),
	body('price')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('price must be specified'),
	body('number_in_stock')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('Number of stock must be specified'),
	body('genre.*').escape(),
	(req, res, next) => {
		const errors = validationResult(req);
		const movie = new Movie({
			title: req.body.title,
			description: req.body.description,
			price: req.body.price,
			number_in_stock: req.body.number_in_stock,
			genre: typeof req.body.genre === 'undefined' ? [] : req.body.genre,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			Genre.find().exec((err, genres) => {
				for (const genre of genres) {
					if (movie.genre.includes(genre._id)) genre.checked = 'true';
				}
				res.render('movie_form', {
					title: 'New Movie',
					movie: movie,
					genres: genres,
					errors: errors.array(),
				});
				return;
			});
		}
		Movie.findByIdAndUpdate(req.params.id, movie, {}, (err, themovie) => {
			if (err) {
				return next(err);
			}
			res.redirect(themovie.url);
		});
	},
];

exports.deleteGet = (req, res, next) => {
	Movie.findById(req.params.id).exec((err, movie) => {
		if (err) {
			return next(err);
		}
		res.render('movie_delete', {
			title: 'Delete Movie',
			movie: movie,
		});
	});
};
exports.deletePost = (req, res, next) => {
	Movie.findByIdAndRemove(req.body.movieId, (err) => {
		if (err) {
			return next(err);
		}
		res.redirect('/movies');
	});
};
