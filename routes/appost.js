const express = require('express');
const appost = express.Router();
const userFuncs = require('../cook/user.cook.js');
const postsFuncs = require('../cook/post.cook.js');
const users = require('../dbcontrol/users.model.js');
const posts = require('../dbcontrol/post.model.js');
const bodyParser = require('body-parser');
const busboyBodyParser = require('busboy-body-parser');
const cookieParser = require('cookie-parser');


const config = require('../locals.js');

appost.post('/compl_remove', (req, res)=>{
  posts
    .findOne({_id: req.body.post_id})
    .exec((err, post)=>{
      if(!err){
        if(!post){
          res.render("error", {status: 404, message: "Post not found"});
        } else {
          if(!req.user || req.user._id.toString() != post.user_id.toString()){
            res.render("error", {status: 403, message: "Unauthorized"});
          } else {
            post.pos_compl_ids.remove(req.body.user_id);
            if(post.pos_compl_ids.length === 0){
              posts
                .findOneAndUpdate({_id: req.body.post_id}, {$unset:{
                  pos_compl_ids: 1
                }})
                .exec((err, data)=>{
                  if(err){
                    res.render("error", {status: 501, message: "Internal server error"});
                  } else {
                    res.redirect(req.headers.referer);
                  }
                });
            } else {
              posts
              .findOneAndUpdate({_id: req.body.post_id}, {$set:{
                pos_compl_ids: post.pos_compl_ids
              }})
              .exec((err, data)=>{
                if(err){
                  res.render("error", {status: 501, message: "Internal server error"});
                } else {
                  res.redirect(req.headers.referer);
                }
              });
            }
          }
        }
      }else{
        res.render("error", {status: 501, message: "Internal server error"});
      }
    });
});


module.exports = appost;
