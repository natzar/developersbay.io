// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var developerSchema = mongoose.Schema({
	name: String,
	hot:Boolean,
	city: String,
	category: String,
	country: String,
	verified: Boolean,
	languages: String,
	available: Boolean,
	updated: Date,
	description: String,
	email: String,
	skills:String,
	image: String,
	website: String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Developer', developerSchema);
