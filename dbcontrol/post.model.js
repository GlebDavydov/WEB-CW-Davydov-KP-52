let mongoose = require('mongoose');

if (!mongoose.connection.readyState){
    mongoose.connect('mongodb://localhost:27017/MAIN_DATABASE');
}

let Schema = mongoose.Schema;
mongoose.Promise = Promise;

let postSchema = new Schema({
  user_id:{
    type: Number,
    required: true
  },
  advType:{
    type: String,
    required: true
  },
  text:{
    type: String,
    required: true,
  },
  isComplete:{
    type: Boolean,
    required: true
  }
});

module.exports = mongoose.model('Post', postSchema);
