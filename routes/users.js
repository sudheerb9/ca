var express = require('express');
var router = express.Router();
var passport = require('passport');
require('./passport')(passport);

router.get('/auth/facebook', passport.authenticate('facebook'))

router.get('/auth/facebook/callback',
  passport.authenticate('facebook',{ scope : ['email'] }, { failureRedirect: '/auth/facebook' }),
  (req, res) => {
    res.redirect('/home')
  })


router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router;
