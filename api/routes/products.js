const express = require('express');
const router = express.Router();

const mysqlConnection = require('../connection/connection');

//Dynamic Conection
const mysql = require('mysql');


const jwt = require('jsonwebtoken');

require('dotenv').config({path:'./.env'});

const passJWT = process.env.PWDJWT;
//console.log(passJWT)
const passDataBase = process.env.PWDATA;
//console.log('*********'+passDataBase);

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

router.post('/create', (req, res) =>{
    let dbName = req.headers[process.env.HARD_HEADER];
    let rut = req.headers['rut_id'];
    //console.log('ESTE ES EL RUT--'+rut);
    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 10,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });
    const { NOMBRE, APELLIDO, CLAVE, ROL_ID, E_MAIL} = req.body;
    let activo = 1;
    
    pool.query('INSERT INTO USERS (NOMBRE, APELLIDO, CLAVE, ROL_ID, RUTEMP, E_MAIL, ACTIVO) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [NOMBRE, APELLIDO, CLAVE, ROL_ID, rut, E_MAIL, activo],
    (err, rows, fields) => {
        if (!err) {
            // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
            res.status(201).json('Usuario Creado Con Exito!!');
        } else {
            // res.json('Error al Crear Usuario');
            res.status(400).json('¡ERROR! No se pudo crear el Usuario');
            console.log("El error es -> "+ err.sqlMessage);
        }
    }
    )
});

router.get('/v1/obtener/usuarios', (req, res) =>{
    let dbName = req.headers[process.env.HARD_HEADER];
    let rut = req.headers['rut_id'];
    //console.log('ESTE ES EL RUT--'+rut);
    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 100,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });
    
    pool.query('SELECT NOMBRE, APELLIDO, CLAVE, ROL_ID, RUTEMP, E_MAIL, ACTIVO from USERS where RUTEMP=?',
    [rut],
    (err, rows, fields) => {
        if (!err) {
            // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
            res.json(rows);
        } else {
            // res.json('Error al Crear Usuario');
            res.status(500).json('¡ERROR! No hay Usuarios para Mostrar');
            console.log("El error es -> "+ err.sqlMessage);
        }
    }
    )
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



module.exports = router;