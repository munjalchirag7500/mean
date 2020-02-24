// product schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const feedback = new Schema({
	name:String,
	email:String,
	subject:String,
	feed:String,
	date_created :{type:Date, default:Date.now}
});
module.exports=mongoose.model('feedback',feedback);