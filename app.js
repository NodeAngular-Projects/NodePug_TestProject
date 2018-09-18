const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');

const app = express();

// Load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/database');

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;

// Connect to mongoose
mongoose.connect(db.mongoURI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Handlebrs Middleware
app.engine('.hbs', exphbs({
  extname: '.hbs',
  defaultLayout: 'main'
}));
app.set('view engine', '.hbs');

// Body parser Middleware
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Method Override Middleware
app.use(methodOverride('_method'));

// Express Session Middleware
app.use(session({
  secret: 'my secret idea',
  resave: false,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Index Route
app.get('/', (req, res) => {
  const title = "Welcome, friend!"
  res.render('index', {
    title: title
  });
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});

// Use routes
app.use('/ideas', ideas);
app.use('/users', users);

const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});