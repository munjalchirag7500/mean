// category schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userlogin = new Schema({
	upname:String,
	upemail:{type:String,unique:true},
	uppassword : String
});
module.exports=mongoose.model('userlogin',userlogin)