// product schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const usermsg = new Schema({
    name:String,
    email:String,
    msg:String,
  date_sent :{type:Date, default:Date.now}
});
module.exports=mongoose.model('usermsg',usermsg);