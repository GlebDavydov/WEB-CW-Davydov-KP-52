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
            res.render("error", {status: 401, message: "Unauthorized"});
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

appost.post('/compl_accept', (req, res)=>{
  posts
    .findOne({_id : req.body.post_id})
    .exec((err, adv)=>{
      if(!err){if(adv){
      if(!req.user || req.user._id.toString() != adv.user_id.toString() ||
      adv.isComplete){
        res.render("error", {status: 401, message: "Unauthorized"});
      } else {
        postsFuncs.myContains(adv.pos_compl_ids, req.body.user_id)
          .then((result)=>{
            if(!result){
              res.render("error", {status : 404, message: "User not found"});
            }else{
              if(!req.body.money_sent || req.body.money_sent > req.user.balance || req.money_sent < adv.minVage){
                  res.redirect(req.headers.referer);
              }else {
                posts
                .findOneAndUpdate({_id: req.body.post_id}, {$unset:{
                  pos_compl_ids: 1
                }}).exec((err, done)=>{
                  if(err){
                    res.render("error", {status: 501, message: "Internal server error"});
                  }
                });
                posts
                .findOneAndUpdate({_id: req.body.post_id}, {$set:{
                  isComplete: true,
                  comp_id: req.body.user_id
                }}).exec((err, done)=>{
                  if(err){
                    res.render("error", {status: 501, message: "Internal server error"});
                  }
                });
                users
                  .findOne({_id : req.user._id})
                  .exec((err,user1)=>{
                    if(!err){
                      if(!user1){
                          res.render("error", {status : 404, message: "User not found"});
                      }else{
                        let balance = user1.balance-req.body.money_sent;
                        users.findOneAndUpdate({_id: req.user._id}, {$set:{balance: balance}}).exec((err,somedata)=>{if(!err){if(!somedata){res.render("error", {status: 404, message: "not found"});}}else{res.render("error", {status:501, message:err});}});
                      }
                    }else{
                      res.render("error", {status : 501, message: "Internal server error"});
                    }
                  });
                users
                .findOne({_id : req.body.user_id})
                .exec((err,user2)=>{
                  if(!err){
                    if(!user2){
                        res.render("error", {status : 404, message: "User not found"});
                    }else{
                      let balance = parseFloat(user2.balance)+parseFloat(req.body.money_sent);
                      console.log(balance);
                      users.findOneAndUpdate({_id: req.body.user_id}, {$set:{balance: balance}}).exec((err,somedata)=>{if(!err){if(!somedata){res.render("error", {status: 404, message: "not found"});}}else{res.render("error", {status:501, message:err});}});
                      res.redirect(req.headers.referer);
                    }
                  }else{
                    res.render("error", {status : 501, message: "Internal server error"});
                  }
                });
              }
            }
          });
        }
      }else{
        res.render("error", {status : 404, message: "User not found"});
      }
    } else {
      res.render("error", {status : 501, message: "Internal server error"});
    }
  });
});


module.exports = appost;
