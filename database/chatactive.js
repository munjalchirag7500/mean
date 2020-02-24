// product schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const chatactive = new Schema({
    name:String,
    email:{type :String , unique:true},
    active:String,
  	date_sent :{type:Date, default:Date.now}
});
module.exports=mongoose.model('chatactive',chatactive);