const Router = require('express')
const userController = require('../controllers/userController');
const router = new Router();
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/registration', userController.registration);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/users', authMiddleware, userController.getUsers);

module.exports = router


