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
        } else if(!req.body.advtype || (req.body.advtype != "iNeed" && req.body.advtype != "iHelp")){
          res.render('error', {status : undefined, message: "Wrong advertisment type"});
        } else {
          let data = {
            user_id : req.user._id,
            text: req.body.text,
            advType: req.body.advType
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
                adverts[adverts.length] = {post : post, user: {name: user.name, _id: user.id}};
              } else {
                console.log(err);
                rej(err);
                }
            } else {
              console.log(err);
              rej(err);
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
