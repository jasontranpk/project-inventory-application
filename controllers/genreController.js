const async = require('async');
const { body, validationResult } = require('express-validator');

const Genre = require('../models/genre');
const Movie = require('../models/movie');

exports.genreList = (req, res, next) => {
	Genre.find({})
		.sort({ name: 1 })
		.exec((err, listGenre) => {
			if (err) {
				return next(err);
			}
			res.render('genre_list', {
				title: 'Genre List',
				genreList: listGenre,
			});
		});
};

exports.detail = (req, res, next) => {
	Genre.findById(req.params.id).exec((err, genre) => {
		if (err) {
			return next(err);
		}
		res.render('genre_detail', {
			title: 'Genre Detail',
			genre: genre,
		});
	});
};

exports.newGet = (req, res, next) => {
	res.render('genre_form', {
		title: 'Add New Genre',
	});
};
exports.newPost = [
	body('name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('name must be specified'),

	body('description')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('Description must be specified'),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render('genre_form', {
				title: 'Create Genre',
				genre: req.body,
				errors: errors.array(),
			});
			return;
		}
		const genre = new Genre({
			name: req.body.name,
			description: req.body.description,
		});
		genre.save((err) => {
			if (err) {
				return next(err);
			}
			res.redirect(genre.url);
		});
	},
];

exports.updateGet = (req, res, next) => {
	Genre.findById(req.params.id).exec((err, genre) => {
		if (err) {
			return next(err);
		}
		res.render('genre_form', {
			title: 'Update Genre',
			genre: genre,
		});
	});
};
exports.updatePost = [
	body('name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('name must be specified'),

	body('description')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('Description must be specified'),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render('genre_form', {
				title: 'Create Genre',
				genre: req.body,
				errors: errors.array(),
			});
			return;
		}
		const genre = new Genre({
			name: req.body.name,
			description: req.body.description,
			_id: req.params.id,
		});
		Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, theGenre) => {
			if (err) {
				return next(err);
			}
			res.redirect(theGenre.url);
		});
	},
];

exports.deleteGet = (req, res) => {
	async.parallel(
		{
			genre(callback) {
				Genre.findById(req.params.id).exec(callback);
			},
			genre_movies(callback) {
				Movie.find({ genre: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.genre == null) {
				res.redirect('/catalog/genres');
			}
			res.render('genre_delete', {
				title: 'Delete Genre',
				genre: results.genre,
				genre_movies: results.genre_movies,
			});
		}
	);
};
exports.deletePost = (req, res) => {
	async.parallel(
		{
			genre(callback) {
				Genre.findById(req.params.id).exec(callback);
			},
			genre_movies(callback) {
				Movie.find({ genre: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.genre_movies > 0) {
				res.render('genre_delete', {
					title: 'Delete Genre',
					genre: results.genre,
					genre_movies: results.genre_movies,
				});
				return;
			}
			Genre.findByIdAndRemove(req.body.genreId, (err) => {
				if (err) {
					return next(err);
				}
				res.redirect('/genres');
			});
		}
	);
};
