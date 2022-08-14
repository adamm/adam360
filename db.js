#!/usr/bin/env node

const mysql = require('mysql');

let local_mysql = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'adam360',
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || 'adam360',
};
let cloud_mysql = {
    user: process.env.DB_USER || 'adam360',
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'adam360',
    socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
};

exports.connect = async () => {
    let connection = local_mysql;
    if (process.env.CLOUD_SQL_CONNECTION_NAME)
        connection = cloud_mysql;
    exports.pool = await mysql.createPool(connection);
    return exports.pool;
};

exports.queryOne = function (sql, args) {
    return new Promise((resolve, reject) => {
        this.pool.query(sql, args, (err, rows) => {
            if (err)
                return reject({ error: err });
            resolve(rows[0]);
        });
    });
};

exports.query = function (sql, args) {
    return new Promise((resolve, reject) => {
        this.pool.query(sql, args, (err, rows) => {
            if (err) {
                console.error(err);

                return reject(new Error(err));
            }
            resolve(rows);
        });
    });
};

exports.close = function () {
    return new Promise((resolve, reject) => {
        this.pool.end(err => {
            if (err)
                return reject(err);
            resolve();
        });
    });
};
