const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));


/**
 * require all the routes here and use them with app.use()
 */
const authRouter = require('./routes/auth.routes');

/**
 * use the routes here with app.use()
 */
app.get('/', (req, res) => {
  res.status(200).send('Interview AI Backend is running');
});

app.use('/api/auth', authRouter);

app.use('/api/interview', require('./routes/interview.routes'));

// keep these last: 404 catch-all, then the error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;