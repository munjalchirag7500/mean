// category schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cat = new Schema({
	cname:{type:String,unique:true},
	description : String,
	image : String,
	date_created :{type:Date, default:Date.now}
});
module.exports=mongoose.model('category',cat);