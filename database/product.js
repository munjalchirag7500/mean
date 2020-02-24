// product schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const product = new Schema({
	pname:{type:String,unique:true},
	description : String,
	image : String,
	productCategory:String,
	price:Number,
	brand:String,
	date_created :{type:Date, default:Date.now}
});
module.exports=mongoose.model('product',product);