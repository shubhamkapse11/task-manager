const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('./config/config'); 


const app =express();
const port = process.env.PORT || 3000;

app.use(express.json({
    limit: '10mb'
}));
app.use(express.urlencoded({
    limit: '10mb',
    extended: true
}));
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credential: true
}));

app.use(express.static("public"));  // This line tells Express to serve static files from the public folder.
app.use(cookieParser())

sequelize.sync({ force: false }).then(() => {
    console.log('Database connected');
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
