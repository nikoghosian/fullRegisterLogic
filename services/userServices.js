const uuid = require('uuid');
const UserModel = require('../models/models').User;
const bcrypt = require('bcrypt');
const mailService = require('./mailServices');
const tokenServices = require('./tokenServices');
const UserDto = require('../dtos/userDto');
const ApiError = require('../execeptions/apiError')


class UserService {
    async getUsersByEmail(email) {
        try {
            const existingUser = await UserModel.findOne({
                where: { email: email }
            });

            return existingUser;
        } catch (e) {
            throw ApiError.BadRequest('Error fetching users by email:');
        }

    }

    async registration(email, password) {
        try {
            const existingUser = await this.getUsersByEmail(email);

            if (existingUser) {
                throw ApiError.BadRequest(`User already registered with email ${email}`);
            }
            const hashPassword = await bcrypt.hash(password, 3);
            const activationLink = uuid.v4();
            const user = await UserModel.create({ email, password: hashPassword, activationLink });
            await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
            const userDto = new UserDto(user);
            const tokens = tokenServices.generateToken({ ...userDto });
            await tokenServices.saveToken(userDto.id, tokens.refreshToken);
            return { ...tokens, user: userDto };
        } catch (e) {
            throw e;
        }
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({ activationLink })
        if (!user) {
            throw ApiError.BadRequest('Uncorrent link to Activated')
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        const user = await this.getUsersByEmail(email);
        if (!user) {
            throw ApiError.BadRequest('User with this Email not Found')
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Wrong Password');
        }
        const userDto = new UserDto(user);
        const tokens = tokenServices.generateToken({ ...userDto });

        await tokenServices.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, user: userDto };



    }
    async logout(refreshToken) {
        const token = await tokenServices.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken){
        if(!refreshToken){
            throw ApiError.UnauthorizedError();
        }
    const userData = tokenServices.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenServices.findToken(refreshToken);
    if(!userData || !tokenFromDb){
        throw ApiError.UnauthorizedError();
    }
    const user = await UserModel.findByPk(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenServices.generateToken({ ...userDto });

    await tokenServices.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
    }

    async getAllUsers(){
        const users = await UserModel.findAll();
        return users;
    }

}
module.exports = new UserService();
