const express = require('express');
const db = express.Router();
const userFuncs = require('../cook/user.cook.js');
const postsFuncs = require('../cook/post.cook.js');
const users = require('../dbcontrol/users.model.js');
const posts = require('../dbcontrol/post.model.js');
const bodyParser = require('body-parser');
const busboyBodyParser = require('busboy-body-parser');
const cookieParser = require('cookie-parser');


const config = require('../locals.js');

db.get('/user/:_id', (req, res)=>{
  users
    .find({_id: req.params.id})
    .exec((err, user)=>{
      if(!err){
        if(user){
          res.json({name:user.name, _id:user._id});
        }else{
          res.render("error", {status: 404, message: "User not found"});
        }
      } else {
        res.render("error", {status: 500, message: "Internal server error"});
      }
    });
});

db.get('/posts/:_id', (req, res)=>{
  posts
    .find({_id: req.params.id})
    .exec((err, post)=>{
      if(!err){
        if(post){
          res.json(post);
        }else{
          res.render("error", {status: 404, message: "User not found"});
        }
      } else {
        res.render("error", {status: 500, message: "Internal server error"});
      }
    });
});

db.get('/posts/filter', (req, res)=>{});

module.exports = db;
