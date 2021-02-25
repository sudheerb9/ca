var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser= require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('cookie-session');
var passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// require('./config/conn');
var mysql = require('mysql');
require('./config/config');
var httpsRedirect = require('express-https-redirect');

var indexRouter = require('./routes/index');

var app = express();
const conn = mysql.createPool({
  host: "localhost",
  user: "wissenaire_sudheer",
  password: "sudheer@wissenaire",
  database: "wissenaire_ca21"
});

// view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'keyboard cat', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

app.use('/', httpsRedirect(true), indexRouter);

//passport oauth 
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user,done){
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
  
passport.use (new FacebookStrategy({
      clientID: '1874655192687215',
      clientSecret: '79c493bdff6b73ef842c2aac5b2980b8',
      callbackURL: "https://ca.wissenaire.org/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      const qr = ("SELECT * from users where email ='" + profile.emails[0].value + "';");
      conn.query(qr, (err, rows) => {
        if (err) {
            throw err;
        }
        if (rows && rows.length === 0) {
          let sql = ("INSERT into users (facebookid,photo,accesstoken,refreshtoken,name,email) VALUES('" + profile.id + "','"+profile.photos[0].value+"', '" + accessToken + "','" + refreshToken + "','" + profile.displayName + "','" + profile.emails[0].value + "');");
          conn.query(sql, function(err, result) {
            if (err) {
                throw err;

            }
            console.log("Fb inserted");
          });
          
          return done(null, profile);
  
        } else {
          console.log("Already logged in");
          return done(null, profile);
  
        }
      });    
    }) 
  })
);

passport.use (new GoogleStrategy({
  clientID: '96689537530-jkk11ojp0i4r1ffq7q6u8idamsm59c9j.apps.googleusercontent.com',
  clientSecret: 'NtXKC_Ba8lAWJGuysBU3ADXm',
  callbackURL: "https://ca.wissenaire.org/auth/google/callback",
  userProfileURL  : 'https://www.googleapis.com/oauth2/v3/userinfo'
},
function(accessToken, refreshToken, profile, done) {
process.nextTick(function() {
  console.log('process.nextick')
  console.log(profile)
  const qr = ("SELECT * from users where email ='" + profile.emails[0].value + "';");
  conn.query(qr, (err, rows) => {
    if (err) {
        throw err;
    }
    if (rows && rows.length === 0) {
      let sql = ("INSERT into users (facebookid,photo,accesstoken,refreshtoken,name,email) VALUES('" + profile.id + "','"+profile.photos[0].value+"', '" + accessToken + "','" + refreshToken + "','" + profile.displayName + "','" + profile.emails[0].value + "');");
      conn.query(sql, function(err, result) {
        if (err) {
            throw err;

        }
        console.log("google inserted");
      });
      
      return done(null, profile);

    } else {
      console.log("Already logged in");
      return done(null, profile);

    }
  });    
}) 
})
);

app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/home', failureRedirect: '/', failureFlash: true }),
  function(req, res) {
    res.redirect('/home')   
  }
);

app.get('/auth/google', passport.authenticate('google', {  scope : ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/home', failureRedirect: '/'}),
  function(req, res) {
    res.redirect('/home')   
  }
);

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

app.get('/user', function(req, res) {
  res.status(200);
  console.log(req.user) 
})
//passport oauth

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;