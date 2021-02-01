var express = require('express');
var router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
    console.log(req.user);
    return next();
  }
  res.redirect('/login')
}
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/home',ensureAuthenticated, function(req, res, next) {
  console.log(req.user);
  res.render('home');
});

router.get('/fbshare',ensureAuthenticated, function(req, res, next) {
  res.render('fbshare',{user:req.user});
});

router.get('/ideate',ensureAuthenticated, function(req, res, next) {
  res.render('ideate',{user:req.user});
});

router.get('/leaderboard',ensureAuthenticated, function(req, res, next) {
  res.render('leaderboard',{user:req.user});
});

router.get('/contact',ensureAuthenticated, function(req, res, next) {
  res.render('contact',{user:req.user});
});

router.get('/activity',ensureAuthenticated, function(req, res, next) {
  res.render('activity',{user:req.user});
});

router.get('/profile',ensureAuthenticated, function(req, res, next) {
  res.render('profile',{user:req.user});
});

module.exports = router;
