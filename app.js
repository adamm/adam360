#!/usr/bin/env node

const express = require('express');
const app = express();
const path = require('path');
const db = require('./db.js');
const PORT = process.env.PORT || 8080;


db.connect().then(pool => {
    app.use((req, res, next) => {
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
    let now = new Date();

    res.send(now.toString());
}




process.on('SIGINT', () => {
    console.log('Shutting down');
    db.close().then(() => {
        process.exit(0);
    });
});
