var express = require('express');
var router = express.Router();
var mysql = require('mysql');

const conn = mysql.createPool({
  host: "localhost",
  user: "wissenaire_sudheer",
  password: "sudheer@wissenaire",
  database: "wissenaire_ca21"
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
    console.log('loggedin')
    return next();
  }
  res.redirect('/login')
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/home',ensureAuthenticated, async function(req, res, next) {
  const qr = ("SELECT * from users where email ='" + req.user.emails[0].value + "';");
  conn.query(qr, (err, rows) => {
    if(err) throw err;
    console.log(rows[0])
    res.render('home', {participant : rows[0]})
  })
});

router.get('/fbshare',ensureAuthenticated, function(req, res, next) {
  const qr = ("SELECT * from users where email ='" + req.user.emails[0].value + "';");
  conn.query(qr, (err, rows) => {
    if(err) throw err;
    console.log(rows[0]);
    const posts = ("SELECT * from posts;");
    conn.query(posts, (err, result) => {
      if(err) throw err;
      console.log(result)
      res.render('fbshare', {participant : rows[0], posts:result})
    })
  })
});

router.get('/ideate',ensureAuthenticated, async function(req, res, next) {
  const qr = ("SELECT * from users where email ='" + req.user.emails[0].value + "';");
  conn.query(qr, (err, rows) => {
    if(err) throw err;
    console.log(rows[0])
    res.render('ideate', {participant : rows[0]})
  })
});

router.get('/leaderboard',ensureAuthenticated, function(req, res, next) {
  const qr = ("SELECT * from users where email ='" + req.user.emails[0].value + "';");
  conn.query(qr, (err, rows) => {
    if(err) throw err;
    console.log(rows[0])
    res.render('leaderboard', {participant : rows[0]})
  })
});

router.get('/contact',ensureAuthenticated, function(req, res, next) {
  const qr = ("SELECT * from users where email ='" + req.user.emails[0].value + "';");
  conn.query(qr, (err, rows) => {
    if(err) throw err;
    console.log(rows[0])
    res.render('contact', {participant : rows[0]})
  })
});

router.get('/activity',ensureAuthenticated, function(req, res, next) {
  const qr = ("SELECT * from users where email ='" + req.user.emails[0].value + "';");
  conn.query(qr, (err, rows) => {
    if(err) throw err;
    console.log(rows[0])
    res.render('activity', {participant : rows[0]})
  })
});

router.get('/profile',ensureAuthenticated, function(req, res, next) {
  const qr = ("SELECT * from users where email ='" + req.user.emails[0].value + "';");
  conn.query(qr, (err, rows) => {
    if(err) throw err;
    console.log(rows[0])
    res.render('profile', {participant : rows[0]})
  })
});

router.get('/post', function(req,res,next){
  res.render('addpost');
})

router.post('/addpost', function(req,res,next){
  const postins = ("INSERT into `posts` (postid) VALUES('" + req.body.postid + "');");
  conn.query(postins, (err, rows) => {
    if(err) throw err;
    console.log(rows)
    const postadd = ("ALTER TABLE `users` ADD `"+req.body.postid+"` INT NULL DEFAULT '0' AFTER `refreshtoken`;");
    conn.query(postadd, (err, rows) => {
      if(err) throw err;
      console.log(rows)
      console.log('postid inserted and column added')
      res.sendStatus(200)
    })
  })
  
})

module.exports = router;
