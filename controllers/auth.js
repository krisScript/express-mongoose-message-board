const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const User = require('../models/user');
const crypto = require('crypto');
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        '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'
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
    errorMessage: message
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
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }

      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password.');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  console.log('is this activated');
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        req.flash(
          'error',
          'E-Mail exists already, please pick a different one.'
        );
        return res.redirect('/signup');
      }
      return bcrypt
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
              throw error;
            });
        });
    })
    .catch(err => {
      console.log(err);
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
          from: 'test@mail.com',
          subject: 'Password reset',
          html: `
      <p>You requested a password reset>/p>
      <a href="http://localhost:3000/reset/${token}"></a>
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
    .then()
    .catch(error => {
      throw error;
    });
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
};

exports.postNewPassword = (req, res, next) => {
  const { newPassword, userId, passwordToken } = req.body;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
  .then(user =>{
    resetUser = user
    return bcrypt.hash(newPassword,12)
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = null;
    resetTokenExpiration = undefined;
    return resetUser.save()
  })
  .then(result => {
    res.redirect('/login')
  })
  .catch(error => {
    throw error
  })
};
