const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
require('../config/conn');
require('../config/config');

module.exports = function (passport){
    passport.serializeUser(function(user,done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id,done){
        
        con.connect(function(err) {
            if (err) throw err;
            else conn.query("select * from users where id = "+id,function(err,rows){
                done(err, rows[0]);
            });
        });
        
    });
    
    passport.use (new FacebookStrategy({
            clientID: config.FACEBOOK_APP_ID,
            clientSecret: config.FACEBOOK_APP_SECRET,
            callbackURL: "https://ca.wissenaire.org/auth/facebook/callback",
            passReqToCallback : true,
            profileFields: ['id', 'emails', 'name']
        },
        function(accessToken, refreshToken, profile, done) {
            
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
}