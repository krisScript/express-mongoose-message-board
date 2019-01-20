const express = require('express');

const messagesController = require('../controllers/messages');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/add-message', isAuth, messagesController.getAddMessage);

router.get('/messages', isAuth, messagesController.getAllMessages);

router.get('/user-messages', isAuth, messagesController.getUserMessages);

router.post('/add-message', isAuth, messagesController.postAddMessage);

router.get('/edit-message/:messageId', isAuth, messagesController.getEditMessage);

router.post('/edit-message', isAuth, messagesController.postEditMessage);

router.post('/delete-message', isAuth, messagesController.postDeleteMessage);

module.exports = router;
