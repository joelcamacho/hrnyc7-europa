var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var request = require('request');

// auth dependencies
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var mongoose = require('mongoose');
var hash = require('bcrypt-nodejs');
var passport = require('passport');
var localStrategy = require('passport-local' ).Strategy;

// user schema/model
var User = require('./db/models/user.js');

// set up express app
var app = express();

// set up port
var port = process.env.PORT || 8080;

//set up mongodb
var db = require('./db/db-config.js');


// define middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//serve up static files
app.use(express.static(__dirname + '/../client'));

// configure passport
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//set up routes
var routes = require('./routes/routes.js')(app, express);

// error handlers
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.end(JSON.stringify({
    message: err.message,
    error: {}
  }));
});

// listen to port
app.listen(port);
console.log('server listening on port ' + port);
console.log('serving static files from' + __dirname + '/../client');