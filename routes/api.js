const express = require('express');
const router = express.Router();
const userFuncs = require('../cook/user.cook.js');
const postsFuncs = require('../cook/post.cook.js');
const users = require('../dbcontrol/users.model.js');
const posts = require('../dbcontrol/post.model.js');
const bodyParser = require('body-parser');
const busboyBodyParser = require('busboy-body-parser');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const session = require('express-session');


const config = require('../locals.js');

router.use(session({
	secret: config.cookieSecret,
	resave: false,
	saveUninitialized: true
}));

router.use(passport.initialize());
router.use(passport.session());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(busboyBodyParser({ limit: '5mb' }));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	//console.log("deserializeUser id: " + id);
	users.findOne({ _id: id}).exec((err, user) => {
    if(err){
      done(err, null);
    } else {
      if(user) {
				done(null, user);
			} else {
				done("No user", null);
			}
    }
  });
});


passport.use(new localStrategy((username, password, done) => {
    users.findOne({
			  email: username,
			  password: userFuncs.HashMD5(password, config.salt)
		  }).exec((err, user) => {
        if(!err){
          //console.log(user);
  				if (user) {
  					done(null, user);
  				} else {
  					done(null, false);
  				}
        } else {
          console.log(err);
  				done(err, null);
        }
      });
}));

/* GET home page. */
router.get('/', (req, res, next)=>{
	let adverts = [];
	posts
		.find({})
		.exec((err, theposts)=>{
			if(!err){
				if(posts.length > 0){
					postsFuncs.myFinder(theposts, adverts)
					.then(()=>{
						//console.log(adverts);
						res.render('index', {user: req.user, adverts: adverts});
					})
					.catch((err)=>{
						res.render('error', {status : 500, message: "Internal server error"});
					});
				} else {
					res.render('index', {user: req.user, adverts: adverts});
				}
			} else {
				console.log(err);
				res.render('error', {status: 500, message: err});
			}
		});
});



router.get('/register', (req, res)=>{
	if(req.user){
		res.render('error', {status: 403, message: "\'ready logged in"});
	} else {
  	res.render('register');
	}
});

router.get('/login', (req, res)=>{
	if(req.user){
		res.redirect('/'); //.render('error', {status: 403, message: "\'ready logged in"});
	} else {
  	res.render('login');
	}
});

router.post('/register', (req, res)=>{
  userFuncs.registerNewUser(req, res);
});


router.post('/login',
	passport.authenticate('local', { failureRedirect: '/login-error' }),
  (req, res) => {
		res.redirect('/profile');
});



router.post('/profile_avatar', (req, res)=>{
			let avaObj = req.files.avatar;
			let base64String = avaObj.data.toString('base64');

			if (!base64String){ base64String=req.user.avatar; }

			users
			.findOneAndUpdate({_id : req.user._id},{
						$set:{
				      avatar : base64String
						}},
						{new : true})
			.exec((err, data)=>{
				if(!err){
					res.redirect('/profile');
				} else {
					res.render('error', {status: 500, message: err});
				}
			});
});

router.get('/login-error', (req, res) => {
  res.render('error', {status : undefined, message: "Incorrect username/password"});
});

router.get('/profile', (req, res) => {
	//console.log(req.body);
	if(req.user){
		users
			.find({_id: req.user._id})
			.exec((err, user)=>{
			if(!err){
				if(user){
		let adverts = [];
		userFuncs.findAndFill(req.user._id, adverts)
			.then(()=>{
				console.log(adverts);
				res.render('profile', {user : req.user, adverts: adverts});
			})
			.catch((err)=>{
				res.render('error', {status: 500, message: err});
			});
		}else{
			res.render('error', {status: 404, message: "User not found"});
		}
		}else{
			res.render('error', {status: 500, message: "Internal server error"});
		}
		});
	} else {res.render('error', {status : 401, message: "Not logged in"});}
});

router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

router.get('/profile/settings', (req, res) => {
	if(req.user){
		res.render('profile_settings', {user: req.user});
	} else {
		res.render('error', {status: 401, message: "Not logged in"});
	}
});

router.post('/profile/settings', (req, res) =>{
	if(req.user){
	users
		.findOne({_id : req.user._id})
		.exec((err, user)=>{
			if(!err){
				if(!user){
					res.render('error', {status: 404, message: "User not found"});
				} else {
					if(!req.body.password){
						res.render('error', {status : undefined, message : "Missing Password"});
						return;
					}else if(user.password != userFuncs.HashMD5(req.body.password, config.salt)){
						//console.log(userFuncs.HashMD5(req.body.password), config.salt);
						res.render('error', {status : undefined, message : "Wrong password"});
						return;
					} else{ if(req.body.newPassword || req.body.newPassword2){
							if(!req.body.newPassword || !req.body.newPassword2){
								res.render('error', {status : undefined, message : "Skipped new password"});
								return;
							} else if(req.body.newPassword != req.body.newPassword2){
								res.render('error', {status : undefined, message : "New password mismmatch"});
								return;
							} else {
								users
								.findOneAndUpdate({_id : req.user._id}, {
									$set:{
										password : userFuncs.HashMD5(req.body.newPassword, config.salt)
									}},
								{new : true})
								.exec((err, data) => {if(err){res.render('error', {status : 500, message: err});return;}});
							}
					}
					if(req.body.email){
						users
						.findOne({email : req.body.email})
						.exec((err, data)=>{
							if(!err){
							if(data){
								res.render('error', {status: undefined, message: "This email is already used"});
								return;
							}else{
								users
									.findOneAndUpdate({_id : req.user._id}, {
											$set:{
												email : req.body.emai
											}},
											{new : true})
									.exec((err, data) => {if(err){res.render('error', {status : 500, message: err});return;}});
									}
								} else {
									res.render('error', {status: 500, message : err});
								}
							});
					}
					if(req.body.name){
						users
						.findOneAndUpdate({_id : req.user._id}, {
							$set:{
								name : req.body.name
							}},
						{new : true})
						.exec((err, data) => {if(err){res.render('error', {status : 500, message: err});return;}});
					}
					if(req.body.descript){
						users
						.findOneAndUpdate({_id : req.user._id}, {
							$set:{
								brief : req.body.descript
							}},
						{new : true})
						.exec((err, data) => {if(err){res.render('error', {status : 500, message: err});return;}});
					}
					if(req.body.place){
						users
						.findOneAndUpdate({_id : req.user._id}, {
							$set:{
								place: req.body.place
							}},
						{new : true})
						.exec((err, data) => {if(err){res.render('error', {status : 500, message: err});return;}});
					}
					res.redirect('/profile');
				}
			}
		}else {
					res.render('error', {status: 500, message: err});
				}
		});
	} else {
		res.render('error', {status : 401, message: "Not logged in"});
	}
});



router.post('/compl_id', (req, res)=>{
	if(!req.user){
		res.render('error', {status: 401, message: "Not logged in"});
	} else {
		if(req.body.adv_id){
			posts
				.findOne({_id: req.body.adv_id})
				.exec((err, adv) => {
					if(!err){
						if(adv){
							if(adv.user_id.toString() == req.user._id.toString()){
								console.log(req.user._id +  "\tAttempted to contribute to own task");
								res.redirect(req.headers.referer);
								return;
							}else if (adv.isComplete){
								console.log(req.user._id + "\tAttempted to contribute to complete task");
								res.redirect(req.headers.referer);
								return;
							}else{
								postsFuncs.myContains(adv.pos_compl_ids, req.user._id).then((data)=>{
									if(data === true){
										console.log(adv._id + " contains " + req.user._id);
										res.redirect(req.headers.referer);
										return;
								} else {
									posts
										.findOneAndUpdate({_id: adv._id},{
										$push:{
											pos_compl_ids: req.user.id
										}})
										.exec((err, data)=>{
											if(err){
												res.render("error", {status: 500, message: "Internal server error"});
											} else{
												if(!data){
										res.render("error", {status: 404, message: "Advert not found"});
									} else {
										res.redirect(req.headers.referer);
									}
								}
							});
							}
						});
					}
					}else{
						res.render("error", {status: 404, message: "Advert not found"});
					}
				} else{
					res.render("error", {status: 500, message: "Internal server error"});
				}
			});
		}
	}
});




const apdb = require("./apdb.js");
const appost = require("./appost.js");
const apuser = require("./apuser.js");
/*const apcomment = require("./apcomment.js");*/

router.use('/db', apdb);
router.use('/post', appost);
router.use('/user', apuser);
/*router.use('/comment', apcomment);*/

module.exports = router;
