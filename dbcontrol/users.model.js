let mongoose = require('mongoose');

if (!mongoose.connection.readyState){
    mongoose.connect('mongodb://localhost:27017/MAIN_DATABASE');
}

let Schema = mongoose.Schema;
mongoose.Promise = Promise;

let userSchema = new Schema({
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
    type: [{type : Schema.Types.ObjectId}]
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
},
{
  collection: 'users'
}
);

module.exports = mongoose.model('User',userSchema, 'users');
