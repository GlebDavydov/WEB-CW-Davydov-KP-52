const express = require('express');
const router = express.Router();
const userFuncs = require('../cook/user.cook.js');
//const advertboard = require('../cook/post.cook.js');
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
	console.log("deserializeUser id: " + id);
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
    console.log("name: " + username + " password: " + password);
	  users.findOne({
			  email: username,
			  password: userFuncs.HashMD5(password, config.salt)
		  }).exec((err, user) => {
        if(!err){
          console.log(user);
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
		.exec((err, posts)=>{
			if(!err){
				posts.forEach((post) => {
					users
						.findOne({_id: post.user_id})
						.exec((err, user)=>{
							if(!err){
								console.log("found an advert");
								adverts[adverts.length] = {post : post, user : user};
								//console.log(adverts);
							} else {
								console.log(err);
								res.render('err', {status: 501, message: err});
							}
						})
						.then(()=>{
							console.log(adverts);
							res.render('index', {user: req.user, adverts: adverts});
						});
				});
			} else {
				console.log(err);
				res.render('err', {status: 501, message: err});
			}
		});
});



router.get('/register', (req, res)=>{
  res.render('register');
});

router.get('/login', (req, res)=>{
  res.render('login');
});

router.post('/register', (req, res)=>{
  userFuncs.registerNewUser(req, res);
});


router.post('/login',
	passport.authenticate('local', { failureRedirect: '/login-error' }),
  (req, res) => {
		console.log('authenticated.');
		console.log(req.body);
    res.redirect('/profile');
});

router.get('/login-error', (req, res) => {
  res.render('error', {status : 501, message: "Login error"});
});

router.get('/profile', (req, res) => {
	console.log(req.body);
	if(req.user){
		res.render('profile', {user : req.user});
	} else {res.render('error', {status : 401, message: "Unauthorized"});}
});

router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
