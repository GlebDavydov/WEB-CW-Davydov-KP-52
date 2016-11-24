var express = require('express');
var router = express.Router();
var userModel = require('../dbcontrol/users.model.js');
var User = userModel.User;


/* GET home page. */
router.get('/', (req, res, next)=>{
  res.render('index');
});

router.get('/register', (req, res, next)=>{
  res.render('register');
});

router.get('/login', (req, res, next)=>{
  res.render('login');
});

router.get('/login/:id', (req, res, next)=>{

  res.render('profile');
});

module.exports = router;
