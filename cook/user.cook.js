const Users = require('../dbcontrol/users.model.js');
const crypto = require('crypto');
const passport = require('passport');
const config = require('../locals.js');
const posts = require('../dbcontrol/post.model.js');
const asyncForEach = require('async-foreach').forEach;

exports.HashMD5 = function(password, salt){
    return crypto.createHash('md5').update(password + salt).digest("hex");
};

exports.findUser = (req, res) => {
  Users.findByID(req.params._id)
    .exec((err, data) => {
        if (err){
            res.render('error', {status : 500, message: "Internal server error"});
        }
    res.json(data);
    });
};

exports.registerNewUser = (req, res) => {
    Users.findOne({email: req.body.email})
      .exec((err, data) => {
          if (err){
              res.render('error', {status : 500, message: "Internal server error"});
          }
          else if (data){
              res.render('error', {status : undefined, message: "Username already picked"});
          }
          else {
            if(!req.body.email || !req.body.name || !req.body.password || !req.body.password2){
              return res.render('error', {status : undefined, message: "You left empty fields"});
            }
            if (req.body.password != req.body.password2){
                return res.render('error', {status : undefined, message: "Passwords do not match"});
            }
            data = {'name':req.body.name, 'email':req.body.email,
            'password':exports.HashMD5(req.body.password, config.salt)};
            let users = new Users(data);
            //console.log(data);
            users.save((err, data) => {
            if (err){
              res.render('error', {status : 500, message: "Internal server error"});
            }
              else{
              data.password = undefined;
              res.redirect("/login");
            }
          });
        }
    });
};

exports.findAndFill = function(_id, adverts){
  return new Promise((resv, rej)=>{
    Users
      .findOne({_id: _id})
      .exec((err, user) => {
        if(!err){
          if(!user){
            rej("No such user");
          } else {
            posts
              .find({user_id : _id})
              .exec((err, theposts)=>{
                if(!err){
                  if(theposts){
                    theposts.forEach((post)=>{
                      adverts[adverts.length] = {user: {name: user.name, _id: user.id}, post: post};
                    });
                  }
                }else{
                  rej(err);
                }
              })
              .then(()=>{
                posts
                  .find({compl_id: _id})
                  .exec((err, theposts)=>{
                    if(!err){
                      if(theposts){
                          theposts.forEach((post)=>{
                            adverts[adverts.length] = {user: {name: user.name, _id: user.id}, post: post};
                          });
                      }
                    }else{
                      rej(err);
                    }
                  })
                  .then(()=>{resv();});
              });
          }
        } else {
          rej(err);
        }
      });
  });
};
