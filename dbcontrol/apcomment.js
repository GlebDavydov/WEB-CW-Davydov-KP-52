let mongoose = require('mongoose');

if (!mongoose.connection.readyState){
    mongoose.connect('mongodb://localhost:27017/MAIN_DATABASE');
}

let Schema = mongoose.Schema;
mongoose.Promise = Promise;

let commentSchema = new Schema({
  user_id:{
    type : Schema.Types.ObjectId,
    required: true
  },
  adv_id:{
    type: Schema.Types.ObjectId
  },
  text:{
    type: String,
    required: true,
  },
  rating:{
    type: Number,
    required: true
  }
},
{
  collection : 'posts'
});

module.exports = mongoose.model('Comment', commentSchema);
