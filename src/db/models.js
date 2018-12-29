const Sequelize = require('sequelize')

const sequelize = new Sequelize('interviewer', 'interviewer', '1234', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0, 
        idle: 10000
    }
})

const ColorScheme = sequelize.define(
    'ColorScheme',
    {
        id: { type: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false }
    }, 
    {
        createdAt: false,
        updatedAt: false
    }
)

const OAuthProvider = sequelize.define(
    'OAuthProvider',
    {
        id: { type: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false }
    }, 
    {
        createdAt: false,
        updatedAt: false
    }
)

const User = sequelize.define(
    'User',
    {
        id: { type: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
        email: { type: Sequelize.STRING, allowNull: false },
        name: { type: Sequelize.STRING, allowNull: false },
        oauthId: { type: Sequelize.STRING, allowNull: true, }
    },
    {
        createdAt: true,
        updatedAt: true,
        paranoid: true
    }
)
User.belongsTo(OAuthProvider)
