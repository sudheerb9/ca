var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var request = require('request');

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
  res.redirect('/auth/facebook')
}

function ensureProfile(req,res,next){
  const qr = ("SELECT * from users where email ='" + req.user.emails[0].value + "';");
  conn.query(qr, (err, rows) => {
    if(err) throw err;
    console.log(rows[0])
    if(rows[0].wissid) return next();
    res.redirect ('/profile');
  })
}
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index1');
});

router.get('/home',ensureAuthenticated, ensureProfile, async function(req, res, next) {
  const qr = ("SELECT * from users where email ='" + req.user.emails[0].value + "';");
  conn.query(qr, (err, rows) => {
    if(err) throw err;
    console.log(rows[0])
    res.render('home', {participant : rows[0]})
  })
});

router.get('/fbshare',ensureAuthenticated, ensureProfile, function(req, res, next) {
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

router.get('/ideate',ensureAuthenticated, ensureProfile, async function(req, res, next) {
  const qr = ("SELECT * from users where email ='" + req.user.emails[0].value + "';");
  conn.query(qr, (err, rows) => {
    if(err) throw err;
    console.log(rows[0])
    res.render('ideate', {participant : rows[0]})
  })
});

router.get('/sharecon',ensureAuthenticated, ensureProfile, function(req, res, next) {
  const qr = ("SELECT * from users where email ='" + req.user.emails[0].value + "';");
  conn.query(qr, (err, rows) => {
    if(err) throw err;
    console.log(rows[0])
    res.render('sharecontact', {participant : rows[0]})
  })
});

router.get('/leaderboard',ensureAuthenticated, ensureProfile, function(req, res, next) {
  const qr = ("SELECT * from users where email ='" + req.user.emails[0].value + "';");
  conn.query(qr, (err, rows) => {
    if(err) throw err;
    console.log(rows[0])
    const select = ("SELECT name, wissid, institute, points FROM users ORDER BY users.points DESC");
    conn.query(select, (err,result)=>{
      if(err) throw err;
      console.log(result);
      var rank = result.map(function(o) { return o.wissid; }).indexOf(rows[0].wissid);
      console.log(rank);
      rows[0].rank = rank;
      res.render('leaderboard', {participant : rows[0],leaderboard :result});
    })
  })
});

router.get('/contact',ensureAuthenticated, ensureProfile, function(req, res, next) {
  const qr = ("SELECT * from users where email ='" + req.user.emails[0].value + "';");
  conn.query(qr, (err, rows) => {
    if(err) throw err;
    console.log(rows[0])
    res.render('contact', {participant : rows[0]})
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

//profile filling
router.post('/profile',function(req,res,next) {
  if(req.body.refca){
    const qr = ("UPDATE users SET wissid = '"+req.body.wissid+"', email2 ='"+req.body.email2+"', phone = '"+req.body.phone+"', gender = '"+req.body.gender+"', institute = '"+req.body.institute+"', year = '"+req.body.year+"', city = '"+req.body.city+"', whyca = '"+req.body.whyca+"' , howca = '"+req.body.howca+"' , ref = '"+req.body.refca+"' WHERE email = '"+req.user.emails[0].value+"' ;");
    conn.query(qr, (err, rows)=>{
      if(err) throw err;
      console.log(rows);
      const part = ("SELECT points from users WHERE wissid = '"+req.body.refca+"' ;");
      conn.query(part, (err,data) =>{
        if(err) throw err;
        if(data) {
          console.log(data[0].points);
          var points = data[0].points + 25;
          const update = ("UPDATE `users` SET points = '"+points+"' WHERE wissid = '"+req.body.refca+"';");
          conn.query(update, (err,result)=>{
            if (err) throw err;
            console.log(result);
            res.redirect('/profile')
          })
        }
        else {
          console.log('no ca found')
          res.redirect('/profile');
        }
      })
    })
  }
  else if(req.body.ref){
    const qr = ("UPDATE users SET wissid = '"+req.body.wissid+"', email2 ='"+req.body.email2+"', phone = '"+req.body.phone+"', gender = '"+req.body.gender+"', institute = '"+req.body.institute+"', year = '"+req.body.year+"', city = '"+req.body.city+"', whyca = '"+req.body.whyca+"' , howca = '"+req.body.howca+"' , ref = '"+req.body.ref+"' WHERE email = '"+req.user.emails[0].value+"' ;");
    conn.query(qr, (err, rows)=>{
      if(err) throw err;
      console.log(rows);
      res.redirect('/profile');
    })
  }
  else {
    const qr = ("UPDATE users SET wissid = '"+req.body.wissid+"', email2 ='"+req.body.email2+"', phone = '"+req.body.phone+"', gender = '"+req.body.gender+"', institute = '"+req.body.institute+"', year = '"+req.body.year+"', city = '"+req.body.city+"', whyca = '"+req.body.whyca+"' , howca = '"+req.body.howca+"' , ref = '' WHERE email = '"+req.user.emails[0].value+"' ;");
    conn.query(qr, (err, rows)=>{
      if(err) throw err;
      console.log(rows);
      res.redirect('/profile');
    })
  }
})

//add post
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

//increase points after sharing a post
router.post('/increase', function(req,res,next){
  var postid = req.body.postid;
  var wissid = req.body.wissid;
  const qr = ("SELECT * from users where wissid ='" + wissid + "';");
  conn.query(qr, (err, rows) => {
    if(err) throw err;
    var points  = rows[0].points + 10;
    const increasepost = ("UPDATE `users` SET `points` = '"+points+"', `"+postid+"` = 1 WHERE `wissid` ='"+ wissid +"';");
    conn.query(increasepost, (err, result)=>{
      if(err) throw err;
      console.log(result);
      res.sendStatus(200);
    })
  })
})

//generate name from wissid in profile page
router.put('/wissid/:id', function(req, res,next){
  var wissid = req.params.id;
  console.log('id'+wissid)
  const qr = ("SELECT name from `users` WHERE wissid = '"+wissid+"';");
  conn.query(qr, (err,result)=>{
    if(err) throw err;
    console.log(result);
    res.send(result[0]);
  })
})

//contact forms
router.post('/ideate', function(req,res,next){
  var field = req.body.field;
  var idea = req.body.idea;
  var wissid = req.body.wissid;
  const qr = ("INSERT into `ideate` (field, idea, user_id) VALUES('" + field + "', '" + idea + "','" + wissid + "');");
  conn.query(qr, (err, result) => {
    if(err) throw err;
    console.log(result);
    res.sendStatus(200);
  })
})

router.post('/sharecon', function(req,res,next){
  var type = req.body.type;
  var contact = req.body.contact;
  var wissid = req.body.wissid;
  const qr = ("INSERT into `sharecon` (type, contact, user_id) VALUES('" + type + "', '" + contact + "','" + wissid + "');");
  conn.query(qr, (err, result) => {
    if(err) throw err;
    console.log(result);
    res.sendStatus(200);
  })
})

router.post('/contact', function(req,res,next){
  var subject = req.body.subject;
  var message = req.body.message;
  var wissid = req.body.wissid;
  const qr = ("INSERT into `contact` (subject, message, user_id) VALUES('" + subject + "', '" + message + "','" + wissid + "');");
  conn.query(qr, (err, result) => {
    if(err) throw err;
    console.log(result);
    res.sendStatus(200);
  })
})

module.exports = router;
