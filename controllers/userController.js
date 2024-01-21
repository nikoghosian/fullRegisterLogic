const ApiError = require("../execeptions/apiError");
const tokenServices = require("../services/tokenServices");
const userService = require("../services/userServices");

class UserController {

    async registration(req, res, next) {
        try {
            const { email, password } = req.body;

            const existingUser = await userService.getUsersByEmail(email);

            if (existingUser) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }
            const userData = await userService.registration(email, password);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            res.send(userData);
        } catch (e) {
            console.error('Error during registration:', e);
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {email,password}= req.body;
            const userData = await userService.login(email,password);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            res.send(userData);
        } catch (e) {
            next(e);

        }
    }
    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);

        }
    }
    async activate(req, res, next) {
        try {

            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);

        } catch (e) {
            next(e)
        }
    }
    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
           return res.json(userData);

        } catch (e) {
            next(e);

        }
    }
    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            return res.json(users)
            } catch (e) {
            next(e);

        }
    }

   
}


module.exports = new UserController();