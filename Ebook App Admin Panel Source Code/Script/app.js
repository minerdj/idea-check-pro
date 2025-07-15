// Environment and core dependencies
require('dotenv').config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const passport = require('passport');
const flash = require("connect-flash");
const session = require('express-session');
const MongoStore = require("connect-mongo");
const db = require('./config/mongoose');
const flashmiddleware = require('./config/flash');

// Initialize express app
const app = express();

// ======================
// Middleware Setup
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ======================
// Session Configuration
// ======================
const sessionStore = MongoStore.create({
    mongoUrl: process.env.DB_CONNECTION,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60, // 14 days
    autoRemove: 'native',
    touchAfter: 24 * 3600 // 24 hours
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    rolling: true,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 14}
}));

// ======================
// Authentication Setup
// ======================
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(flashmiddleware.setflash);

// User session middleware
app.use((req, res, next) => {
    res.locals.user = req.session.user_id;
    next();
});

// ======================
// Route Configuration
// ======================
const adminRoute = require("./routes/adminRoutes");
const apiRoute = require("./routes/apiRoutes");
app.use('/', adminRoute);
app.use('/api', apiRoute);

// ======================
// Server Initialization
// ======================
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});