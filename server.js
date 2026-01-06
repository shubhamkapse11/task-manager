const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();
const { sequelize } = require('./models');


const app =express();
const port = process.env.PORT || 7000;

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


// sequelize.sync() connects the models to the database tables. 
// { force: false } means it will NOT drop existing tables. If you set it to true, it would drop and recreate tables on every startup (useful for dev, dangerous for prod). 
sequelize.sync({ force: false }).then(() => {
    console.log('Database connected');
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const userRoute = require('./routes/user.route');

app.use('/api/user', userRoute);