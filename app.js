/*
npm i express dotenv ejs body-parser bcryptjs passport passport-local express-session express-flash method-override

TUTORIAL: https://www.youtube.com/watch?v=-RCnNyD0L-s&t=1678s

*/
require('dotenv').config({ path: './.env' });
const express=require("express");
app = express();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const passport = require("passport");
const initializePassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");

// dummy database
const users = [];


initializePassport.initialize(
    passport, 
    username => users.find(user => user.username === username), 
    id => users.find(user => user.id === id)
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(flash());
app.use(session(
    {
    secret: "mysecret123",
    resave: false, 
    saveUninitialized: false
    }
));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method")); // so we can use post request in form


// Set locals.. just for fun
app.locals.copyrightYear = () => {
    return new Date().getFullYear();
}
app.locals.myLocalValue1 = "Local1";


//
app.get("/", (req, res) => {
    res.render("index");
})


// login
app.get("/login", checkNotAutenticated, (req, res) => {
    res.render("login", {username: "", password: "", message: ""});
})


// do the login
app.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true
}))


// Register
app.get("/register", (req, res) => {
    res.render("register", {username: "", password: "", message: ""});
})

app.post("/register", async (req, res) => {
    try {
        const user = req.body;

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        users.push({
            id: Date.now().toString(),
            username: user.username, 
            password: hash
        });
        console.log(users);
        return res.redirect("/login");

    } catch (e) {
        return res.render("register", {username: req.body.username, password: req.body.password, message: e.message});
    }
})

// dashboard
app.get("/dashboard", checkAutenticated, (req, res) => {
    res.render("dashboard", {username: req.user.username});
})


// logout (using: _method)
app.delete('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });



// Register
app.get("/register", (req, res) => {
    res.render("register", {username: "", password: "", message: ""});
})


// IS
function checkAutenticated(req, res, next) {
    console.log("checkAutenticated");

    if (req.isAuthenticated()) {
        console.log("YES");
        return next();
    }
    console.log("NO");
    return res.redirect("/login");
}

// NOT
function checkNotAutenticated(req, res, next) {
    console.log("checkNotAutenticated");

    if (req.isAuthenticated()) {
        return res.redirect("/dashboard");
    }
    // not
    return next();
    
}
// error
app.get("*", (req, res) => {
    res.send("404");
})

// START, port 3000
app.listen(process.env.LOCAL_PORT, () => {
    console.log(`Listening on port: ${process.env.LOCAL_PORT}`);
});

