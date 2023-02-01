const mysql = require('mysql');

require('dotenv').config({path:'./.env'});

const mysqlConnection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PWDATA,
    database: process.env.DATAB,
    port: process.env.PORT_DATA
});

mysqlConnection.connect( err => {
    if (err) {
        console.log('ERROR en db: ', err);
        return;
    } else {
        console.log(Object);
    
    }
});

module.exports = mysqlConnection;