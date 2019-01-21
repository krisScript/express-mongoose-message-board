const express = require('express');

const {body} = require('express-validator/check');

const router = express.Router();
const User = require('../models/user');
const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.'),
    body('password', 'Password has to be valid.')
      .isLength({ min: 8 })
      .isAlphanumeric()
  ],
  authController.postLogin
);

router.post(
  '/signup',
  [
    body('firstName','please enter valid name')
    .isLength({min:1})
    .isString(),
    body('lastName','please enter valid name')
    .isLength({min:1})
    .isString(),
    body('email', 'Please enter valid email!')
      .isEmail()
      .custom((email, { req }) => {
        return User.findOne({ email: email }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              'Email is already used,please user another one'
            );
          }
        });
      }),
    body('password', 'Please enter password with atleast 8 character long ')
      .isLength({ min: 8 })
      .isAlphanumeric()
      .trim(),
    body('matchPassword').trim().isLength({ min: 8 })
    .isAlphanumeric().custom((value, {req}) => {
      if (value !== req.body.password) {
        throw new Error('Passwords have to match!');
      }
      return true;
    })
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
