var express = require('express');
var router = express.Router();
var passport = require('passport');
require('./passport')(passport);

router.get('/facebook', passport.authenticate('facebook'))

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/facebook' }),
  (req, res) => {
    res.redirect('/home')
  })


router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router;
