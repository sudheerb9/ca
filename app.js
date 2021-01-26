var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser= require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var session = require('cookie-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('./config/conn');
require('./config/config');

var indexRouter = require('./routes/index');

var app = express();

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
        clientID: config.FACEBOOK_APP_ID,
        clientSecret: config.FACEBOOK_APP_SECRET,
        callbackURL: "https://ca21.wissenaire.org/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        console.log('Hi this is passport using facebook strategy');
        
        query = "SELECT * FROM users WHERE facebookid = "+profile.id+"";
        conn.connect((err) => {
          if (err) throw err;
          console.log('Connected!');
        });
        conn.query(query,function(err,user){
          console.log('query executed');
            if (err)
                return done(err);
            else if (user) {
                console.log(user);
                return done(null, user);
            } 
            else {
                console.log('else');
                var insertquery = "INSERT INTO users (name, email, facebookid, photo, accesstoken, refreshtoken) \
                VALUES ( '"+profile.displayName+"', '"+profile.emails[0].value+"', '"+profile.id+"', '"+profile.photos[0].value+"', '"+accessToken+"', '"+refreshToken+"' ) "
                conn.query(insertquery, function (err, result) {
                    if (err) throw err;
                    console.log(result);
                });
                console.log(profile.emails[0].value);
                return done(null, user);
            }
        });
        conn.end((err) => {
          // The connection is terminated gracefully
          // Ensures all remaining queries are executed
          // Then sends a quit packet to the MySQL server.
        })
            
    }
));

app.use('/', indexRouter);

app.get('/auth/facebook', passport.authenticate('google',  { scope : ['profile', 'email'] }), (req, res) => {
  console.log('In auth route');
})

app.get('/auth/facebook/callback', passport.authenticate('google', { successRedirect:'/home', failureRedirect: '/auth/google'}) ,
  (req, res) => {
      console.log("login done");
      res.redirect('/home');
  }
);

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
