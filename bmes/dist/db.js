"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
exports.pool = new pg_1.Pool({
    user: 'postgres', //default
    host: 'localhost', //default
    database: 'db_mes', //Enter your own database name
    password: 'PPPP123123', //Enter your own database password
    port: 5432, //default
});
exports.pool.connect((err) => {
    if (err) {
        console.error('Connection error', err.stack);
    }
    else {
        console.log('Connected to PostgreSQL');
    }
});
