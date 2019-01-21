const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const User = require('../models/user');
const crypto = require('crypto');
const { validationResult } = require('express-validator/check');
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        'Your sendgrid key'
    }
  })
);
exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    title: 'Login',
    signup: false,
    oldInput: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      matchPassword: ''
    },
    errorMessage: message,
    validationErrors: []
  });
  
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/signup',
    title: 'Signup',
    signup: true,
    errorMessage: message,
    validationErrors: [],
    oldInput: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      matchPassword: ''
    }
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      title: 'Login',
      errorMessage: errors.array()[0].msg,
      signup:false,
      oldInput:{
        email,
        password
      },
      validationErrors: errors.array()
    });
  }
  User.findOne({ email })
    .then(user => {
      if (!user) {
      return  res.status(422).render('auth/login', {
          path: '/login',
          title: 'Login',
          signup:false,
          errorMessage: "Invalid email or password",
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        });
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              res.redirect('/');
            });
          }
          return res.status(422).render('auth/login', {
            path: '/login',
            title: 'Login',
            errorMessage: 'Invalid email or password.',
            signup:false,
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: []
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const { firstName, lastName, email, password, matchPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/login', {
      path: '/signup',
      title: 'Signup',
      signup: true,
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password, firstName, lastName, matchPassword },
      validationErrors:errors.array()
    });
  }
  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        messagesData: { messages: [] }
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      return transporter
        .sendMail({
          to: email,
          from: 'test@mail.com',
          subject: 'Signup Succseeded',
          html: '<h1>OK:Login</h1>'
        })
        .catch(error => {
          console.log('error');
          throw error;
        });
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    title: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account found');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'auth@mail.com',
          subject: 'Password reset',
          html: `
          <a href="http://localhost:3000/reset/${token}">Reset</a>
      <p>You requested a password reset></p>
    
      `
        });
      })
      .catch(error => {
        throw error;
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const { token } = req.params;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        title: 'New password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(error => {
      throw error;
    });
};

exports.postNewPassword = (req, res, next) => {
  const { newPassword, userId, passwordToken } = req.body;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(error => {
      throw error;
    });
};
