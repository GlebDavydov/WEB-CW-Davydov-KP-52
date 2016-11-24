var Users = require('../dbcontrol/users.model.js');

exports.findUser = (req, res)=>{
    Users.findByID(req.params._id)
        .exec((err, data) => {
            if (err){
                res.status(500).json(err);
            }
      res.json(data);
      });
};
