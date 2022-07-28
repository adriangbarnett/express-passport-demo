const { authenticate } = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcryptjs');
const { nextTick } = require("process");


function initialize(passport, getUserByUsername, getUserById) {

    const authenticateUser = async (username, password, done) => {
        
        const user = getUserByUsername(username);

        console.log("try authenticateUser: " + user.id);

        if (user == null) {
            return (done(null, false, {message: "User not found"}))
        }

        // compare password
        try {

            if (await bcrypt.compare(password, user.password)) {
                // valid
                console.log("Login PASS");
                return done(null, user);

            } else {
                // fail
                console.log("Login FAIL");
                return done(null, false, {message: "Incorrect password"});
            }
        } catch (e) {
            return done(e)
        }
    }


    passport.use(new LocalStrategy({usernameField: "username" }, authenticateUser))

    passport.serializeUser((user, done) => done(null, user.id)); // saves into our session

    passport.deserializeUser((id, done) => { return done(null, getUserById(id)) } // logout from session
    
    );

}


module.exports = {
    initialize
}