var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var session = require('cookie-session');
const FacebookStrategy = require('passport-facebook').Strategy;
require('./config/config');
require('./config/conn');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret : "Our little Secret Here",
  resave : false,
  saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);

passport.serializeUser(function(user,done){
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
  
passport.use (new FacebookStrategy({
        clientID: config.FACEBOOK_APP_ID,
        clientSecret: config.FACEBOOK_APP_SECRET,
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

app.get('/auth/facebook', passport.authenticate('facebook', {
scope: ['public_profile', 'email']}), (req, res) => {
  console.log('In auth route');
})

app.get('/auth/facebook/callback', 
passport.authenticate('facebook', {successRedirect:'/home', failureRedirect: '/auth/facebook' }),
(req, res) => {
  console.log('Hi this is callback');
  alert('Team wissenaire welcomes you ! ${user.name}')
  
})

router.get('/logout', (req, res) => {
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
