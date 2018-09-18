const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {
  ensureAuthenticated
} = require('../helpers/auth');


// Load Idea Model
require('../models/Idea');
const Idea = mongoose.model('Idea');

// Idea Index Page
router.get('/', ensureAuthenticated, (req, res) => {
  Idea.find({
      user: req.user.id
    })
    .sort({
      date: 'desc'
    })
    .then(ideas => {
      res.render('ideas/index', {
        ideas
      });
    });
});

// Add Idea Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('ideas/add');
});

// Edit Idea Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
      _id: req.params.id
    })
    .then(idea => {
      if (idea.user.id !== req.user.id) {
        req.flash('error_message', 'Not Authorized');
        res.redirect('ideas');
      }
      res.render('ideas/edit', {
        idea
      });
    });
});

// Add Form Process
router.post('/', ensureAuthenticated, (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({
      text: 'Please, add a title'
    });
  }

  if (!req.body.details) {
    errors.push({
      text: 'Please, add some details'
    });
  }

  if (errors.length > 0) {
    res.render('ideas/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  }

  const newIdea = new Idea({
    title: req.body.title,
    details: req.body.details,
    user: req.user.id
  });
  newIdea
    .save()
    .then(idea => {
      req.flash('success_msg', 'Video idea created.');
      res.redirect('/ideas');
    })
    .catch(err => {
      console.log(err);
      retutn;
    });
});

// Edit Form Process
router.put('/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
      _id: req.params.id
    })
    .then(idea => {
      // new values
      idea.title = req.body.title;
      idea.details = req.body.details;

      idea.save()
        .then(idea => {
          req.flash('success_msg', 'Video idea updated.');
          res.redirect('/ideas');
        });
    });
});

// Delete Idea
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Idea.deleteOne({
      _id: req.params.id
    })
    .then(() => {
      req.flash('success_msg', 'Video idea removed.');
      res.redirect('/ideas');
    });
});

module.exports = router;