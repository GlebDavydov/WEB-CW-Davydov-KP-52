let express = require('express');
let router = express.Router();
let users = require('../cook/user.cook.js');

/* GET home page. */
router.get('/', (req, res, next)=>{
  res.render('index');
});

router.get('/register', (req, res)=>{
  res.render('register');
});

router.get('/login', (req, res)=>{
  res.render('login');
});

router.get('/login/:_id', (req, res)=>{
  users.findUser(req, res);
});

router.post('/register', (req, res)=>{
  //console.log(req.body);
  users.registerNewUser(req, res);
});

module.exports = router;
