const express = require('express');
const router = express.Router();
const upload = require("../Middleware/multerMiddleware");
const jwtMiddleware = require("../Middleware/jwtMiddleware");
const userController = require("../Controller/userController");
const requestController = require("../Controller/requestController");
const messageController = require("../Controller/messageController")

// user

router.post('/register', upload.single('profile'), userController.registerUser);
router.post('/login', userController.loginUser);
router.get("/getallusers",  userController.getallusers);
router.put("/edituser/:id", jwtMiddleware, upload.single("profile"), userController.edituserController);

//request

router.post("/request", jwtMiddleware, requestController.sendRequest);
router.get("/requests", jwtMiddleware, requestController.getRequests);
router.put("/request/:id", jwtMiddleware, requestController.updateRequestStatus);
router.get('/requests/accepted', jwtMiddleware, requestController.getAcceptedRequests);


//message

router.post('/messages', messageController.sendMessage);
router.get('/messages/:user1/:user2', messageController.getMessages);

router.delete('/messages/:messageId', jwtMiddleware, messageController.deleteMessage);

module.exports = router;
