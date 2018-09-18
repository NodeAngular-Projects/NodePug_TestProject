const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Load User Model
require('../models/User');
const User = mongoose.model('User');

// User Login Route
router.get('/login', (req, res) => {
  res.render('users/login');
});

// User Register Route
router.get('/register', (req, res) => {
  res.render('users/register');
});

// Login Form POST
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/ideas',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Register Form Post
router.post('/register', (req, res) => {
  let errors = [];

  if (req.body.password != req.body.confpassword) {
    errors.push({
      text: 'Passwords do not match'
    });
  }

  if (req.body.password.length < 4) {
    errors.push({
      text: 'Password must be at least 4 characters'
    });
  }

  if (errors.length > 0) {
    res.render('users/register', {
      errors: errors,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      confpassword: req.body.confpassword
    });
  }

  User.findOne({
      email: req.body.email
    })
    .then(user => {
      if (user) {
        req.flash('error_msg', 'Email already registered');
        res.redirect('/users/login');
      }
    });

  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        throw err;
      }

      newUser.password = hash;
      newUser.save()
        .then(user => {
          req.flash('success_msg', 'You are now registered and can log in');
          res.redirect('/users/login');
        })
        .catch(err => {
          console.log(err);
          return;
        })
    });
  });
});

// Logout User
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;