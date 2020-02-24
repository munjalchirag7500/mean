// product schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cart = new Schema({
	email:String,
	pname:String,
	description : String,
	image : String,
	productCategory:String,
	price:Number,
	brand:String,
	date_created :{type:Date, default:Date.now}
});
module.exports=mongoose.model('cart',cart);