'use strict';

var User = require('../models/user'),
plans = User.getPlans();

exports.getHome = function(req, res, next){
  var form = {},
  error = null;

  var USER = new Object;
  USER.username = -1;
 
  if (req.user){
  	USER = req.user;
  }
 
  res.render(req.render, {user: USER, form: form, error: error, plans: plans});
};