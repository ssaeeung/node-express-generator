var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
var cors = require('./cors');
const { Router } = require('express');

var usersRouter = express.Router();
usersRouter.use(bodyParser.json());

usersRouter.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
  (req,res,next) => {
  User.find({})
  .then((users) => {
    console.log('Hello');
      if (users != null) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(users);
      }
  }, (err) => next(err))
  .catch((err) => next(err));
});

usersRouter.post('/signup', cors.corsWithOptions, (req, res, next) => {
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Registration Successful!'});
      });
    }
  });
});

usersRouter.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, admin: req.user.admin, token: token, status: 'You are successfully logged in!'});
});

usersRouter.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

usersRouter.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

module.exports = usersRouter;
