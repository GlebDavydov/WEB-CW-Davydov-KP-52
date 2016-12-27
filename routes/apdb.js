const express = require('express');
const apdb = express.Router();
const userFuncs = require('../cook/user.cook.js');
const postsFuncs = require('../cook/post.cook.js');
const users = require('../dbcontrol/users.model.js');
const posts = require('../dbcontrol/post.model.js');
const bodyParser = require('body-parser');
const busboyBodyParser = require('busboy-body-parser');
const cookieParser = require('cookie-parser');


const config = require('../locals.js');

apdb.get('/user/:_id', (req, res)=>{
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

apdb.get('/post/delete/:_id', (req, res)=>{
		posts
		 .findOne({_id: req.params._id})
		 .exec((err, post)=>{
			 if(!err){
				 if(post){
					 if(req.user){
						if(req.user._id.toString() == post.user_id.toString()){
							 	posts
									.remove({_id: req.params._id})
									.exec((err, data)=>{
										if(!err){
											res.redirect("/profile");
										} else {
											res.render('error', {status: 500, message: "Internal server error"});
										}
									});
						 } else {
							 res.render("error", {status : 403, message: "Unauthorized"});
						 }
					 } else {
						 res.render("error", {status : 403, message: "Unauthorized"});
					 }
				 }else{
					 res.render('error', {status: 404, message: "Advert not found"});
				 }
			 } else {
				 res.render('error', {status: 500, message: "Internal server error"});
			 }
		 });
});


apdb.get('/post/:_id', (req, res)=>{
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


apdb.post('/post/start', (req, res) => {
	if(!req.user){
		res.render('error', {status: 401, message: "Not logged in"});
	}else{
		postsFuncs.startAPost(req, res);
	}
});

apdb.get('/filter', (req, res)=>{});


module.exports = apdb;
