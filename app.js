#!/usr/bin/env node

const express = require('express');
const session = require('express-session');
const MysqlStore = require('express-mysql-session')(session);
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const logger = require('morgan');
const cors = require('cors');

const db = require('./db.js');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

db.connect().then(pool => {
    let mysqlStore = new MysqlStore({}, pool);

    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: mysqlStore,
    }));

    app.use((req, res, next) => {
        res.locals.db = db;
        res.locals.pool = db.pool;
        req.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        let fields = [req.ip, req.method, req.url];
        console.log(`> ${fields.join(' ')}`);
        next();
    });
    app.get('/', get_index);
    app.use(express.static(path.join(__dirname, 'public')));
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}...`);
    });
});




function get_index (req, res) {
    // TODO if 360 is closed, display a closed.html instead
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
}




process.on('SIGINT', () => {
    console.log('Shutting down');
    db.close().then(() => {
        process.exit(0);
    });
});
