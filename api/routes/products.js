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


// Get Product By Id
router.get('/get/product/:id', (req, res) =>{
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

//Get All Families
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
            res.status(500).json('¡ERROR! No hay Familia');
            console.log("El error es -> "+ err.sqlMessage);
        }
    }
    )
});

//Get all Departaments
router.get('/get/departament', (req, res) =>{
    let dbName = req.headers[process.env.HARD_HEADER];    
   
    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 100,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });

    const JOIN_QUERY = `SELECT DEPARTAMENT.NOMBRE , FAMILY.NOMBRE AS FAMILY, CODDEPARTAMENTO
    FROM DEPARTAMENT
    JOIN FAMILY ON FAMILY.CODFAMILIA = DEPARTAMENT.CODFAMILIA`
    
    pool.query(JOIN_QUERY,
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

router.post('/create/departament', (req, res) =>{
    let dbName = req.headers[process.env.HARD_HEADER];

    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 10,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });
    const { NOMBRE, CODFAMILIA } = req.body;
    
    pool.query('INSERT INTO DEPARTAMENT (NOMBRE, CODFAMILIA) VALUES (?, ?)',
    [ NOMBRE, CODFAMILIA ],
    (err, rows, fields) => {
        if (!err) {
            // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
            res.status(201).json('Departamento Creado Con Exito!!');
        } else {
            // res.json('Error al Crear Usuario');
            res.status(409).json('¡ERROR! No se pudo crear el Departamento');
            console.log("El error es -> "+ err.sqlMessage);
        }
    }
    )
});

//Get all Categories
router.get('/get/categories', (req, res) =>{
    let dbName = req.headers[process.env.HARD_HEADER];    
   
    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 100,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });
    
    const JOIN_QUERY = `SELECT CATEGORY.NOMBRE AS CATEGORY, FAMILY.NOMBRE AS FAMILY, DEPARTAMENT.NOMBRE AS DEPARTAMENT
    FROM CATEGORY
    JOIN FAMILY ON FAMILY.CODFAMILIA = CATEGORY.CODFAMILIA
    JOIN DEPARTAMENT ON DEPARTAMENT.CODDEPARTAMENTO = CATEGORY.CODDEPARTAMENTO`;
    pool.query(JOIN_QUERY,
    (err, rows, fields) => {
        if (!err) {
            // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
            res.json(rows);
        } else {
            // res.json('Error al Crear Usuario');
            res.status(500).json('¡ERROR! No hay Categorias');
            console.log("El error es -> "+ err.sqlMessage);
        }
    }
    )
});

//create Category
router.post('/create/category', (req, res) =>{
    let dbName = req.headers[process.env.HARD_HEADER];

    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 10,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });
    const { NOMBRE, CODFAMILIA, CODDEPARTAMENTO} = req.body;
    
    pool.query('INSERT INTO CATEGORY (NOMBRE, CODFAMILIA, CODDEPARTAMENTO) VALUES (?, ?, ?)',
    [ NOMBRE, CODFAMILIA, CODDEPARTAMENTO ],
    (err, rows, fields) => {
        if (!err) {
            // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
            res.status(201).json('Categoria Creada Con Exito!!');
        } else {
            // res.json('Error al Crear Usuario');
            res.status(409).json('¡ERROR! No se pudo crear la Categoria');
            console.log("El error es -> "+ err.sqlMessage);
        }
    }
    )
});


module.exports = router;