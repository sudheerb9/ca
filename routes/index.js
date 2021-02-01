var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/home', function(req, res, next) {
  res.render('home',{user:req.user});
});

router.get('/fbshare', function(req, res, next) {
  res.render('fbshare',{user:req.user});
});

router.get('/ideate', function(req, res, next) {
  res.render('ideate');
});

router.get('/leaderboard', function(req, res, next) {
  res.render('leaderboard',{user:req.user});
});

router.get('/contact', function(req, res, next) {
  res.render('contact',{user:req.user});
});

router.get('/activity', function(req, res, next) {
  res.render('activity',{user:req.user});
});

router.get('/profile', function(req, res, next) {
  res.render('profile',{user:req.user});
});

module.exports = router;
