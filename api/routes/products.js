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
    //console.log('ESTE ES EL ID--'+id);
    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 1000,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });
    try {
        const CALL_PROCEDURE = `CALL getProductById(${id})`;
        pool.query(CALL_PROCEDURE,
        (err, rows, fields) => {
            if (!err) {
                // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
                res.json(rows[0][0]);
            } else {
                // res.json('Error al Crear Usuario');
                res.status(500).json('¡ERROR! No hay Producto');
                console.log("El error es -> "+ err.sqlMessage);
            }
        }
        )
    } catch (error) {
        console.log(error)
    }
   
});

//Get All Families
router.get('/get/family', (req, res) =>{
    let dbName = req.headers[process.env.HARD_HEADER];    
   
    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 1000,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });
    
    pool.query('SELECT * FROM FAMILY ORDER BY FAMILY.NOMBRE',
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
        connectionLimit: 1000,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });

    const CALL_PROCEDURE = `CALL GetDepartments()`;
    
    pool.query(CALL_PROCEDURE,
    (err, rows, fields) => {
        if (!err) {
            // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
            res.json(rows[0]);
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
        connectionLimit: 1000,
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
        connectionLimit: 1000,
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
        connectionLimit: 1000,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });
    
    const JOIN_QUERY = `SELECT CATEGORY.NOMBRE AS CATEGORY, FAMILY.NOMBRE AS FAMILY, DEPARTAMENT.NOMBRE AS DEPARTAMENT
    FROM CATEGORY
    JOIN FAMILY ON FAMILY.CODFAMILIA = CATEGORY.CODFAMILIA
    JOIN DEPARTAMENT ON DEPARTAMENT.CODDEPARTAMENTO = CATEGORY.CODDEPARTAMENTO
    ORDER BY FAMILY.NOMBRE`;
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
        connectionLimit: 1000,
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

//Get Departaments By Category
router.get('/get/departament/by/family', (req, res) =>{
    let dbName = req.headers[process.env.HARD_HEADER];
    let codCategory = req.headers['cod-family']; 
   
    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 1000,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });

    const JOIN_QUERY = `SELECT DEPARTAMENT.NOMBRE, DEPARTAMENT.CODDEPARTAMENTO FROM DEPARTAMENT
    JOIN FAMILY ON FAMILY.CODFAMILIA = DEPARTAMENT.CODFAMILIA
    WHERE DEPARTAMENT.CODFAMILIA =${codCategory}
    ORDER BY DEPARTAMENT.NOMBRE`
    
    pool.query(JOIN_QUERY,
    (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            // res.json('Error al Crear Usuario');
            res.status(500).json('¡ERROR! No hay Departamento');
            console.log("El error es -> "+ err.sqlMessage);
        }
    }
    )
});

//Get Categories By Departaments
router.get('/get/categories/by/departaments', (req, res) =>{
    let dbName = req.headers[process.env.HARD_HEADER];
    let codDepa = req.headers['cod-depa']; 

    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 1000,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });

    const CALL_PROCEDURE = `CALL getCategoriesByDepartment(${codDepa})`;
    
    pool.query(CALL_PROCEDURE,
    (err, rows, fields) => {
        if (!err) {
            const categories = rows[0];
            res.json(categories);
        } else {
            // res.json('Error al Crear Usuario');
            res.status(500).json('¡ERROR! No hay Categorias');
            console.log("El error es -> "+ err.sqlMessage);
        }
    }
    )
});

// router.post('/create/product', (req, res) => {
//     let dbName = req.headers[process.env.HARD_HEADER];

//     // Create connection pool for MySQL
//     const pool = mysql.createPool({
//         connectionLimit: 1000,
//         host: process.env.HOST,
//         user: process.env.USER,
//         password: process.env.PWDATA,
//         database: dbName  // default database
//     });

//     const { CODPRODUCTO, CODPRODTEC, DESCRIPCION, UNIDAD, TIPOA, CODFAMILIA, CODDEPTO, CODCATEGORIA} = req.body;
    
//     pool.query(
//         'CALL createProduct(?, ?, ?, ?, ?, ?, ?, ?)',
//         [CODPRODUCTO, CODPRODTEC, DESCRIPCION, UNIDAD, TIPOA, CODFAMILIA, CODDEPTO, CODCATEGORIA],
//         (err, rows, fields) => {
//             if (!err) {
//                 res.status(201).json('Articulo Creado Con Exito!!');
//             } else {
//                 res.status(409).json('¡ERROR! No se pudo crear el Articulo');
//                 console.log("El error es -> "+ err.sqlMessage);
//             }
//         }
//     );
// });


router.post('/create/product', (req, res) => {
    let dbName = req.headers[process.env.HARD_HEADER];

    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 1000,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });

    const { CODPRODUCTO, CODPRODTEC, DESCRIPCION, UNIDAD, TIPOA, CODFAMILIA, CODDEPTO, CODCATEGORIA, CODLISTA, PRECIO} = req.body;
    
    pool.query(
        'CALL createProductAndPrice(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [CODPRODUCTO, CODPRODTEC, DESCRIPCION, UNIDAD, TIPOA, CODFAMILIA, CODDEPTO, CODCATEGORIA, CODLISTA, PRECIO],
        (err, rows, fields) => {
            if (!err) {
                res.status(201).json('Articulo Creado Con Exito!!');
            } else {
                res.status(409).json('¡ERROR! No se pudo crear el Articulo');
                console.log("El error es -> "+ err.sqlMessage);
            }
        }
    );
});



//Get All Products
router.get('/get/products', (req, res) =>{
    let dbName = req.headers[process.env.HARD_HEADER];
   
    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 1000,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });

    const codLista = '01P'
    const CALL_PROCEDURE = `CALL GetProductsWithPrice('${codLista}')`;
    
    pool.query(CALL_PROCEDURE,
        (err, rows, fields) => {
            if (!err) {
                // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
                res.json(rows[0]);
            } else {
                // res.json('Error al Crear Usuario');
                res.status(500).json('¡ERROR! No hay Producto');
                console.log("El error es -> "+ err.sqlMessage);
            }
        }
        )
    });

//Get All PRICELIST
router.get('/get/pricelist', (req, res) =>{
    let dbName = req.headers[process.env.HARD_HEADER];
   
    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 1000,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });
    
    pool.query("SELECT * FROM PRICELIST",
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

    //Get the last CODPRODUCT
    router.get('/get/last/codproduct', (req, res) => {
        let dbName = req.headers[process.env.HARD_HEADER];
        let characters = req.headers['characters-xxx']; 
    
        // Create connection pool for MySQL
        const pool = mysql.createPool({
            connectionLimit: 1000,
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PWDATA,
            database: dbName  // default database
        });
    
        const CALL_PROCEDURE = `CALL lastCodproduct('${characters}')`;
        
        pool.query(CALL_PROCEDURE, (err, rows, fields) => {
            if (!err) {
                let response = rows[0];
    
                // Si no hay datos en el body de la respuesta, retornar código 204
                if (!response || response.length === 0) {
                    res.sendStatus(204);
                } else {
                    res.json(response[0]);
                }
            } else {
                res.status(500).json('¡ERROR! No hay CODPRODUCTO');
                console.log("El error es -> "+ err.sqlMessage);
            }
        });
    });

    router.put('/edit/:id', (req, res) =>{
        let dbName = req.headers[process.env.HARD_HEADER];
        let id = req.params.id;
        const pool = mysql.createPool({
            connectionLimit: 10,
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PWDATA,
            database: dbName  // default database
        });
        const { DESCRIPCION, PRECIO, UNIDAD, TIPOA, CODLISTA } = req.body;

        const CALL_PROCEDURE = `CALL update_product_and_price('${id}', '${DESCRIPCION}', '${UNIDAD}',
                                '${TIPOA}', '${PRECIO}', '${CODLISTA}')`;
        
        pool.query(CALL_PROCEDURE,
        (err, rows, fields) => {
            if (!err) {
                // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
                res.status(200).json(`ID: ${id}. Actualizado Con Exito!!`);
            } else {
                // res.json('Error al Crear Usuario');
                res.status(400).json('¡ERROR! No se pudo Actualizar el Usuario');
                console.log("El error es -> "+ err.sqlMessage);
            }
        }
        )
    });



module.exports = router;