const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const advertiserRoutes = require('./routes/advertiserRoutes');


dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));


app.use('/api/auth', authRoutes);
app.use('/api/advertiser', advertiserRoutes);


app.get('/', (req, res) => res.send('AdOnWheels API is running...'));

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
