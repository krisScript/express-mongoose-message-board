const express = require('express');
const path = require('path');


//Models

const User = require('./models/user');

//Routers
const homeRouter = require('./routes/home');
const authRouter = require('./routes/auth');
const messagesRouter = require('./routes/messages');

//Controllers
const errorController = require('./controllers/error');

//Third pary
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const csrf = require('csurf');
const flash = require('connect-flash');
const sassMiddleware = require('node-sass-middleware');


const app = express();

const MONGODB_URI =
  'Your Mongo Connection'
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const csrfProtection = csrf();
app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(
  sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: false, // true = .sass and false = .scss
    sourceMap: true
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});


app.use(homeRouter);
app.use(messagesRouter)
app.use(authRouter);

process.on('unhandledRejection', (reason, p) => {});

app.use(errorController.get404);

mongoose
  .connect(
    MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(result => {
    app.listen(3000);
  })
  .catch(error => {
    throw error
  });
