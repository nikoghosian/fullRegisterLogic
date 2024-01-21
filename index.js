require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Sequelize = require('./db');
const cookieParser = require('cookie-parser');
const models = require('./models/models')
const router = require('./router/index')
const errorMiddleware = require('./middlewares/error-middleware')

const PORT = process.env.PORT || 5000;
const app = express()

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api',router);
app.use(errorMiddleware);


const start = async () => {
    try {
        await Sequelize.authenticate()
        await Sequelize.sync()
        app.listen(PORT, () => console.log(`Server Started On Port ${PORT}`))

    } catch (e) {
        console.log(e);
    }
}

start();