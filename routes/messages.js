const express = require('express');

const messagesController = require('../controllers/messages');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
const {body} = require('express-validator/check');
router.get('/add-message', isAuth, messagesController.getAddMessage);

router.get('/messages', isAuth, messagesController.getAllMessages);

router.get('/user-messages', isAuth, messagesController.getUserMessages);

router.post(
  '/add-message',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('messageContent','Message should be atleast 5 letters')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  messagesController.postAddMessage
);

router.get(
  '/edit-message/:messageId',
  isAuth,
  messagesController.getEditMessage
);

router.post(
  '/edit-message',
  [
    body('title','Invalid Title')
      .isString()
      .isLength({ min: 1 })
      .trim(),
    body('messageContent','Message should be atleast 5 letters')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  messagesController.postEditMessage
);

router.post('/delete-message', isAuth, messagesController.postDeleteMessage);

module.exports = router;
