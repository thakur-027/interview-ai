const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));


/**
 * require all the routes here and use them with app.use()
 */
const authRouter = require('./routes/auth.routes');

/**
 * use the routes here with app.use()
 */
app.use('/api/auth', authRouter);

app.use('/api/interview', require('./routes/interview.routes'));

module.exports = app;