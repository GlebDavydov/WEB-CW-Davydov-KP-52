var mongoose = require('mongoose');

if (!mongoose.connection.readyState){
    mongoose.connect('mongodb://localhost:27017/MAIN_DATABASE');
}

var Schema = mongoose.Schema;
mongoose.Promise = Promise;

var userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  balance:{
    type: Number,
    required: true,
    default: 0.0
  },
  rating:{
    type: Number,
    reuired: true,
    default: 0.0
  },
  isadmin:{
    type: Boolean,
    required: true,
    default: false
  },
  post_ids:{
    type: [Number]
  },
  place:{
    type: String
  },
  avatar:{
    type: String
  },
  brief:{
    type: String
  }
});

module.exports = mongoose.model('User',userSchema);
