const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
    email: { type: DataTypes.STRING, unique: true, allowNull: false, validate:{
        isEmail:{
            args:true,
            msg:'Wrong Email Format'
    } ,
},
    },
    password: { type: DataTypes.STRING, allowNull: false,
        validate: {
            len: {
              args: [[1, 32]],
              msg: 'Wrong Password Format'
            }
          }
           },
    isActivated: { type: DataTypes.BOOLEAN, defaultValue: false },
    activationLink: { type: DataTypes.STRING },
});

const Token = sequelize.define('token', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    refreshToken: { type: DataTypes.STRING, allowNull: false },
});

User.hasOne(Token)
Token.belongsTo(User)


module.exports = {
    User,
    Token
};
