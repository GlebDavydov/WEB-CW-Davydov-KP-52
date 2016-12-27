const express = require('express');
const apuser = express.Router();
const userFuncs = require('../cook/user.cook.js');
const postsFuncs = require('../cook/post.cook.js');
const users = require('../dbcontrol/users.model.js');
const posts = require('../dbcontrol/post.model.js');
const bodyParser = require('body-parser');
const busboyBodyParser = require('busboy-body-parser');
const cookieParser = require('cookie-parser');


const config = require('../locals.js');

apuser.get('/:_id', (req, res)=>{
	if(req.user){
		if(req.user._id == req.params._id){
			res.redirect('/profile');
			return;
		}
	}
	let adverts = [];
	users
		.findOne({_id : req.params._id})
		.exec((err, user)=>{
			if(!err){
				if(!user){
					res.render('error', {status: 404, message: "User not found."});
				} else {
					userFuncs.findAndFill(user._id, adverts)
					.then(()=>{
						res.render('user', {aUser : user, adverts: adverts, user : req.user});
					})
					.catch((err)=>{
						console.log(err);
						if(err == "No such user"){
							res.render('error', {status: 404, message: err});
						}else{
							res.render('error', {status: 500, message: "Internal server error"});
						}
					});
				}
			} else {
				res.render('error', {status: 500, message: err});
			}
		});
});


module.exports = apuser;
