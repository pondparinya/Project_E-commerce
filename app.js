var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var productdb = require('./models/products')
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
require('./config/passport');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var stripe = require('stripe')('sk_test_51Hqx98I1kRWYSgPMaU99FfeIy75Z9RwgbryWd8Yz7rTeEqlh8FJrHYHIhNu8dSVghT59SAhcUXK9CZDkn7uoXSmH00nxqpfgNp')


var app = express();
app.use(session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true
    }))
    // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// setup Public
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.locals.formatMoney = function(number) {
        return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    // Setup Passport
app.use(passport.initialize());
app.use(passport.session());
// Share object
app.get('*', function(req, res, next) {
    res.locals.users = req.user;
    next();
});
app.post('/payment', function(req, res) {
    var token = req.body.stripeToken;
    var amount = req.body.amount;
    var charge = stripe.charges.create({
        amount: amount,
        currency: "usd",
        source: token
    }, function(err, charge) {
        if (err) throw err
    });
    req.session.destroy();
    res.redirect("/");
})

// Connect database 

const url = "mongodb+srv://ecommerce:ecommerce@cluster0.idq5h.mongodb.net/users?retryWrites=true&w=majority";
mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(function() {

        console.log("Connecting to Database Name : users success!")
    })
    .catch(function(err) {
        console.log(err)
        console.log("Fail to connect database")
    })

// Use URL & Router 
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);







// All error 

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};

//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
// });

module.exports = app;