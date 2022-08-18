const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MovieSchema = new Schema({
	title: { type: String, required: true, maxLength: 100 },
	description: { type: String, required: true, maxLength: 1000 },
	genre: [{ type: Schema.Types.ObjectId, ref: 'Genre' }],

	price: { type: Number, required: true },
	number_in_stock: { type: Number, required: true },
});

MovieSchema.virtual('url').get(function () {
	return `/movies/${this._id}`;
});

module.exports = mongoose.model('Movie', MovieSchema);
