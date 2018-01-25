const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

//Load User Model
require('./models/User');


//Passport Config
require('./config/passport')(passport);

//Load Routes
const index = require('./routes/index');
const stories = require('./routes/stories');
const auth = require('./routes/auth');

//Load Keys
const keys = require('./config/keys');

//Map global promises
mongoose.Promise = global.Promise;
//Mongoose connect
mongoose.connect(keys.mongoURI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

const app = express();

//express-handlebars middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//Cookie-parser middleware
app.use(cookieParser());

//Express-session middleware
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
}));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Global Variables
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//Use Routes
app.use('/', index);
app.use('/auth', auth);
app.use('/stories', stories);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});