const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Story = mongoose.model('stories');
const User = mongoose.model('users');
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

//Stories Index
router.get('/', (req, res) => {
  Story.find({ status: 'public'})
  .populate('user')
  .sort({date: 'desc'})
    .then(stories => {
      res.render('stories/index', {
        stories: stories
      });
    });
});

//Show Single Story
router.get('/show/:id', (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
  .populate('user')
  .populate('comments.commentUser')
  .then(story => {
    res.render('stories/show', {
      story: story
    });
  });
});

//Add Story form
router.get('/add', ensureAuthenticated,  (req, res) => {
  res.render('stories/add');
});

//Edit Story form
router.get('/edit/:id', ensureAuthenticated,  (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
  .then(story => {
    if(story.user != req.user.id) {
      res.redirect('/stories');
    } else {
      res.render('stories/edit', {
        story: story
      });
    } 
  });
});

//Edit Process Form(PUT)
router.put('/:id', (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
  .then(story => {
    let allowComments;

  if(req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }

  //New Values
  story.title = req.body.title;
  story.body = req.body.body;
  story.allowComments = allowComments;
  story.status = req.body.status;

  story.save()
    .then(story => {
      res.redirect('/dashboard');
    });
  });
});

//Process Add Story
router.post('/', (req, res) => {
  let allowComments;

  if(req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }

  const newStory = {
    title: req.body.title,
    body: req.body.body,
    status: req.body.status,
    allowComments: allowComments,
    user: req.user.id
  }

  //Create Story
  new Story(newStory)
    .save()
    .then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });
});

//Delete story
router.delete('/:id', (req, res) => {
  Story.remove({_id: req.params.id})
  .then(() => {
    res.redirect('/dashboard');
  });
});

//Add Comment
router.post('/comment/:id', (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
  .then(story => {
    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id
    } 

    //Add to comments array
    story.comments.unshift(newComment); //Adds it to the beginning of array

    story.save()
      .then(story => {
        res.redirect(`/stories/show/${story.id}`);
      });
  });
});

module.exports = router;
