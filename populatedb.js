#! /usr/bin/env node

console.log(
	'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true'
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async');
var Genre = require('./models/genre');
var Movie = require('./models/movie');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const genres = [];
const movies = [];

function genreCreate(name, desc, cb) {
	var genre = new Genre({ name: name, description: desc });

	genre.save(function (err) {
		if (err) {
			cb(err, null);
			return;
		}
		console.log('New Genre: ' + genre);
		genres.push(genre);
		cb(null, genre);
	});
}

function MovieCreate(title, description, genre, price, number_in_stock, cb) {
	movieDetail = {
		title,
		description,
		price,
		number_in_stock,
	};
	if (genre != false) movieDetail.genre = genre;

	var movie = new Movie(movieDetail);
	movie.save(function (err) {
		if (err) {
			cb(err, null);
			return;
		}
		console.log('New Movie: ' + movie);
		movies.push(movie);
		cb(null, movie);
	});
}

function createGenre(cb) {
	async.series(
		[
			function (callback) {
				genreCreate('Fantasy', 'Fantasy World', callback);
			},
			function (callback) {
				genreCreate('Science Fiction', 'Sci-fi Movies', callback);
			},
			function (callback) {
				genreCreate('Drama', 'Romantic Movies', callback);
			},
		],
		// optional callback
		cb
	);
}
function createMovie(cb) {
	async.parallel(
		[
			function (callback) {
				MovieCreate(
					'Prey',
					'The origin story of the Predator in the world of the Comanche Nation 300 years ago. Naru, a skilled warrior, fights to protect her tribe against one of the first highly-evolved Predators to land on Earth.',
					[genres[1]],
					15,
					12,
					callback
				);
			},
			function (callback) {
				MovieCreate(
					'The Lord of the Rings: The Rings of Power',
					'Prime Video\'s "Lord of the Rings" prequel series, which is set thousands of years before the film trilogy during the Second Age of Middle-earth, will depict how Melkor, the primordial source of all things evil, was defeated during the War of Wrath, leading to the rise of the second Dark Lord: Sauron. So obviously hardcore J.R.R. Tolkien-heads are losing it. Casual viewers will be introduced to a new cast of characters traversing the far reaches of Middle-earth during the show\'s ultimate 5-season run.',
					[genres[1], genres[2]],
					12,
					13,
					callback
				);
			},
			function (callback) {
				MovieCreate(
					'Day Shift',
					'A hard-working, blue-collar dad who just wants to provide a good life for his quick-witted 8-year-old daughter. His mundane San Fernando Valley pool cleaning job is a front for his real source of income: hunting and killing vampires.',
					[genres[3]],
					1,
					5,
					callback
				);
			},
		],
		// Optional callback
		cb
	);
}
async.series(
	[createGenre, createMovie],
	// Optional callback
	function (err, results) {
		if (err) {
			console.log('FINAL ERR: ' + err);
		} else {
			console.log('Genre: ' + genres);
		}
		// All done, disconnect from database
		mongoose.connection.close();
	}
);
