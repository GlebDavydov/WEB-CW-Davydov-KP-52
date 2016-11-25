let Users = require('../dbcontrol/users.model.js');
let crypto = require('crypto');
let passport = require('passport');
let fs = require('fs');
let config = require('../locals.js');

exports.HashMD5 = function(password, salt){
    return crypto.createHash('md5').update(password + salt).digest("hex");
};

exports.findUser = (req, res) => {
  Users.findByID(req.params._id)
    .exec((err, data) => {
        if (err){
            res.status(500).json(err);
        }
    res.json(data);
    });
};

exports.registerNewUser = (req, res) => {
    Users.findOne({email: req.body.email})
      .exec((err, data) => {
          if (err){
              res.status(500).json(err);
          }
          else if (data){
              res.json({error: 'User with this login/email already exists'});
          }
          else {
            if (req.body.password != req.body.password2){
                return res.json({error: 'Passwords do not match.'});
            }
            data = {'name':req.body.name, 'email':req.body.email,
            'password':exports.HashMD5(req.body.password, config.salt)};
            let users = new Users(data);
            //console.log(data);
            users.save((err, data) => {
            if (err){
              res.status(500).json(err);
            }
              else{
              data.password = undefined;
              res.json(data);
            }
          });
        }
    });
};
