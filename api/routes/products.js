const express = require('express');
const router = express.Router();

const mysqlConnection = require('../connection/connection');

//Dynamic Conection
const mysql = require('mysql');

require('dotenv').config({path:'./.env'});


router.get(process.env.PASSMAXI, (req, res) =>{
    // mysqlConnection.query('SELECT * FROM USER',  (err, rows, fields) =>{
    mysqlConnection.query('SELECT * FROM USER',  (err, rows, fields) =>{
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
});


router.get('/obtener/:id', (req, res) =>{
    let dbName = req.headers[process.env.HARD_HEADER];
    let id = req.params.id;
    console.log('ESTE ES EL ID--'+id);
    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 100,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });
    
    pool.query('SELECT * FROM PRODUCT WHERE CODPRODUCTO=?',
    [id],
    (err, rows, fields) => {
        if (!err) {
            // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
            res.json(rows);
        } else {
            // res.json('Error al Crear Usuario');
            res.status(500).json('¡ERROR! No hay Producto');
            console.log("El error es -> "+ err.sqlMessage);
        }
    }
    )
});

router.get('/get/family', (req, res) =>{
    let dbName = req.headers[process.env.HARD_HEADER];    
   
    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 100,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });
    
    pool.query('SELECT * FROM FAMILY',
    (err, rows, fields) => {
        if (!err) {
            // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
            res.json(rows);
        } else {
            // res.json('Error al Crear Usuario');
            res.status(500).json('¡ERROR! No hay Producto');
            console.log("El error es -> "+ err.sqlMessage);
        }
    }
    )
});

router.post('/create/family', (req, res) =>{
    let dbName = req.headers[process.env.HARD_HEADER];

    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 10,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });
    const { NOMBRE} = req.body;
    
    pool.query('INSERT INTO FAMILY (NOMBRE) VALUES (?)',
    [NOMBRE],
    (err, rows, fields) => {
        if (!err) {
            // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
            res.status(201).json('Familia Creada Con Exito!!');
        } else {
            // res.json('Error al Crear Usuario');
            res.status(409).json('¡ERROR! No se pudo crear la Familia');
            console.log("El error es -> "+ err.sqlMessage);
        }
    }
    )
});


module.exports = router;