var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var bodyParser = require('body-parser');

var passwordless = require('passwordless');
// var passwordless = require('../../');

var MongoStore = require('passwordless-mongostore');
var email   = require("emailjs");

var routes = require('./routes/index');

var app = express();

// TODO: email setup (has to be changed)
var yourEmail = 'noreply@gugabooks.com';
var yourPwd = 'Jijsslz8';
var yourSmtp = 'smtp.gugabooks.com';
var smtpServer  = email.server.connect({
   user:      'noreply@gugabooks.com', 
   password:  'Jijsslz8', 
   host:      'smtp.gugabooks.com', 
   ssl:       false
});

// TODO: MongoDB setup (given default can be used)
var pathToMongoDb = 'mongodb://localhost/gugabooks';

// TODO: Path to be send via email
var host = 'http://localhost:3000/';

// Setup of Passwordless
passwordless.init(new MongoStore(pathToMongoDb));
passwordless.addDelivery(
    function(tokenToSend, uidToSend, recipient, callback) {
        // Send out token
        smtpServer.send({
           text:    'Hello!\nYou can now access your account here: ' 
                + host + '?token=' + tokenToSend + '&uid=' + encodeURIComponent(uidToSend), 
           from:    yourEmail, 
           to:      recipient,
           subject: 'Token for ' + host
        }, function(err, message) { 
            if(err) {
                console.log(err);
            }
            callback(err);
        });
    });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Standard express setup
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(expressSession({secret: '42'}));
app.use(express.static(path.join(__dirname, 'public')));

// Passwordless middleware
app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken({ successRedirect: '/' }));

// CHECK /routes/index.js to better understand which routes are needed at a minimum
app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
