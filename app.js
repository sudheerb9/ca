var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser= require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var session = require('cookie-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// require('./config/conn');
var mysql = require('mysql');
require('./config/config');

var indexRouter = require('./routes/index');

var app = express();
const conn = mysql.createPool({
  host: "localhost",
  user: "wissenaire_sudheer",
  password: "sudheer@wissenaire",
  database: "wissenaire_ca21"
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret : "Our little Secret Here",
  resave : false,
  saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user,done){
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
  
passport.use (new GoogleStrategy({
      clientID: '96689537530-jkk11ojp0i4r1ffq7q6u8idamsm59c9j.apps.googleusercontent.com',
      clientSecret: 'NtXKC_Ba8lAWJGuysBU3ADXm',
      callbackURL: "https://ca21.wissenaire.org/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      const qr = ("SELECT * from users where email ='" + profile.emails[0].value + "';");
        conn.query(qr, (err, rows) => {
          if (err) {
            throw err;
          }
          if (rows && rows.length === 0) {
            console.log(profile.emails[0].value);
            console.log(profile.id);
            console.log(profile.displayName);
            console.log("Creating profile");
            let sql = ("INSERT into users (facebookid,photo,accesstoken,refreshtoken,name,email) VALUES('" + profile.id + "','"+profile.photos[0].value+"', '" + accessToken + "','" + refreshToken + "','" + profile.displayName + "','" + profile.emails[0].value + "');");
            conn.query(sql, function(err, result) {
                if (err) {
                    throw err;

                }
                console.log("fb inserted");
            });
            
            return done(null, true);

          } else {
            console.log("Account already exists");      
            return done(null, false);
      }
    });
    
  });
}));

app.get('/auth/google', passport.authenticate('google', {scope:['profile', 'email']}));

app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/home', failureRedirect: '/', failureFlash: true }),
    function(req, res) {
      res.redirect('/home')   
    }
);


app.use('/', indexRouter);

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})


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
