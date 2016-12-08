const posts = require('../dbcontrol/post.model.js');
const users = require('../dbcontrol/users.model.js');
const asyncForEach = require('async-foreach').forEach;

exports.startAPost = function(req, res){
  users.findOne({_id: req.user._id})
  .exec((err, user)=>{
    if(!err){
      if(!user){
        res.render('error', {status: 404, message: "User not found"});
      } else {
        if(!req.body.text){
          res.render('error', {status : undefined, message: "Empty advertisment text"});
        } else {
          let data = {
            user_id : req.user._id,
            text: req.body.text
          };
          let post = new posts(data);
            post.save((err, data)=>{
              if(err){
                res.render('error', {status: 500, message: "Internal server error"});
              } else {res.redirect('/profile');}
            });
        }
      }
    }else{
      res.render('error', {status: 500, message: "Internal server error"});
    }
  });
};

exports.myFinder = (theposts, adverts)=>{
    return new Promise((resv, rej)=>{
      asyncForEach(theposts, function(post, i, theposts){
          let done = this.async();
          setTimeout(()=>{
          users
          .findOne({_id: post.user_id})
          .exec((err, user)=>{
            if(!err){
              if(user){
                console.log('step');
                adverts[adverts.length] = {post : post, user : user};
              } else {
                console.log(err);
                rej(err);
                //res.render('err', {status: 500, message: err});
              }
            } else {
              console.log(err);
              rej(err);
              //res.render('err', {status: 500, message: err});
            }
          })
          .then(()=>{
            done();
          });
        });
      }, function(err){
        console.log("resolved");
        resv();
      });
    });
};
