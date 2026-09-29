const mongoose=require('mongoose');
module.exports=mongoose.model('Record',new mongoose.Schema({module:String,studentId:String,title:String,status:String,date:Date,amount:Number,description:String,metadata:Object},{timestamps:true}));
