var express = require('express');
var router = express.Router();
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
require('../config/conn');
require('../config/config');

  console.log('Hi this is passport');
  passport.serializeUser(function(user,done){
		done(null, user);
	});

	passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });
    
  passport.use (new FacebookStrategy({
          clientID: "1874655192687215",
          clientSecret: "79c493bdff6b73ef842c2aac5b2980b8",
          callbackURL: "https://ca.wissenaire.org/auth/facebook/callback"
      },
      function(accessToken, refreshToken, profile, done) {
          console.log('Hi this is passport using facebook strategy');
          conn.connect(function(err) {
              if (err) throw err;
              else {
                  query = "SELECT * FROM users WHERE facebookid = "+profile.id+"";
                  conn.query(query,function(err,user){
                  
                      if (err)
                          return done(err);
                      else if (user) {
                          console.log('user');
                          return done(null, user);
                      } 
                      else {
                          console.log('else');
                          var insertquery = "INSERT INTO users (name, email, facebookid, photo, accesstoken, refreshtoken) \
                          VALUES ( "+profile.displayName+", "+profile.emails[0].value+", "+profile.id+", "+profile.photos[0].value+", "+accessToken+", "+refreshToken+" ) "
                          conn.query(insertquery, function (err, result) {
                              if (err) throw err;
                              console.log(result);
                          });
                          console.log(profile.emails[0].value);
                          return done(null, user);
                      }
                  });
              }
          })
      }
  ));

router.get('/auth/facebook', passport.authenticate('facebook'))

router.get('/auth/facebook/callback', 
  passport.authenticate('facebook',{ scope : ['email'] }, { failureRedirect: '/auth/facebook' }),
  (req, res) => {
    console.log('Hi this is callback');
    res.redirect('/home')
  })


router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router;
