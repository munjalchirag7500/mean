// product schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const order = new Schema({
	oData:Object,
    buyer:String,
    orderId:String,
    email:String,
  date_ordered :{type:Date, default:Date.now}
});
module.exports=mongoose.model('order',order);