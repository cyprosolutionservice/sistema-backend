const express = require('express');
const router = express.Router();

const mysqlConnection = require('../connection/connection');

//Dynamic Conection
const mysql = require('mysql');


const jwt = require('jsonwebtoken');

require('dotenv').config({ path: './.env' });

const passJWT = process.env.PWDJWT;
//console.log(passJWT)
const passDataBase = process.env.PWDATA;
//console.log('*********'+passDataBase);

router.get(process.env.PASSMAXI, (req, res) => {
    // mysqlConnection.query('SELECT * FROM USER',  (err, rows, fields) =>{
    mysqlConnection.query('SELECT * FROM USER', (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
        // Cerrar la conexión
        mysqlConnection.end();
    });
});

// router.post('/singin2', (req, res) =>{
//     let dbName = req.headers[process.env.HARD_HEADER];
//     //console.log(dbName);
//     // Create connection pool for MySQL
//     const pool = mysql.createPool({
//         connectionLimit: 100,
//         host: process.env.HOST,
//         user: process.env.USER,
//         password: process.env.PWDATA,
//         database: dbName  // default database
//     });
//     const {CLAVE} = req.body;

//     pool.query('SELECT NOMBRE, CLAVE, RUTEMP, ROL_ID from USERS where CLAVE=?',
//     [CLAVE],
//     (err, rows, fields) => {
//         if (!err) {
//             if (rows.length >0) {
//                 let data = JSON.stringify(rows[0]);

//                 var parsedData = JSON.parse(data);
//                 // Fk_data = parsedData.RUTEMP;
//                 // console.log(Fk_data);

//                 const datos = {parsedData};
//                 const options = { expiresIn: '10h' };
//                 const token = jwt.sign(datos, passJWT, options);
//                 // const token = jwt.sign(datos, passJWT, { expiresIn: '20s' });
//                 //res.json({token});
//                 res.json({token, parsedData});
//             } else {
//                 res.json('Usuario ó Clave incorrectos');
//             }
//         } else {
//             res.json('Error de Acceso');
//             console.log(err);
//         }
//         // Liberar la conexión al pool en lugar de cerrarla
//         pool.release();
//     });
// });

router.post('/singin2', (req, res) => {
    let dbName = req.headers[process.env.HARD_HEADER];
    //console.log(dbName);
    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 100,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName // default database
    });
    const { CLAVE } = req.body;

    // Obtener una conexión del pool
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return res.json('Error de Acceso');
        }

        // Ejecutar la consulta SQL en la conexión obtenida
        connection.query('SELECT NOMBRE, CLAVE, RUTEMP, ROL_ID from USERS where CLAVE=?',
            [CLAVE],
            (err, rows, fields) => {
                // Liberar la conexión al pool
                connection.release();
                if (!err) {
                    if (rows.length > 0) {
                        let data = JSON.stringify(rows[0]);

                        var parsedData = JSON.parse(data);

                        const datos = { parsedData };
                        const options = { expiresIn: '10h' };
                        const token = jwt.sign(datos, passJWT, options);

                        res.json({ token, parsedData });
                    } else {
                        res.json('Usuario ó Clave incorrectos');
                    }
                } else {
                    console.log(err);
                    res.json('Error de Acceso');
                }


            });
    });
});


router.post('/singin', (req, res) => {
    const user = req.body;

    const pool = mysql.createPool({
        connectionLimit: 100,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: process.env.DATAB // default database
    });
    // Obtener una conexión del pool
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return res.json('Error de Acceso');
        }

        // Ejecutar la primera consulta SQL para obtener los detalles del usuario
        const QUERY_SELECT_USER = `CALL SP_GET_USER('${user.E_MAIL}', '${user.CLAVE}')`;

        connection.query(QUERY_SELECT_USER, (error, results) => {

            console.log("Este es el primer Login -> "+results);
            console.log("Este es el primer Login error -> "+error);
            if (error) {
                // Manejar errores de base de datos
                console.error('Error conectando a la base de datos: ' + error.stack);
                res.status(500).send('Error interno del servidor (Datos erroneos)');
                return;
            }

            if (results[0].length === 0) {
                // Manejar credenciales de inicio de sesión incorrectas
                res.status(401).send('Nombre de usuario o contraseña incorrectos');
                return;
            }

            let data1 = JSON.stringify(results[0][0]);
            let parsedData;
            try {
                parsedData = JSON.parse(data1);
            } catch (err) {
                console.error('Error analizando JSON: ' + err.stack);
                res.status(500).send('Error interno del servidor (JSON)');
                return;
            }

            let Fk_data = parseInt(parsedData.RUTEMP);
            console.log('Esta es la llave foranea ' + Fk_data);
            const datos = { data1 };
            const options = { expiresIn: '10h' };
            const token = jwt.sign(datos, passJWT, { expiresIn: '20s' });

            // Ejecutar la segunda consulta SQL para obtener los detalles de la base de datos
            const SQLJoin = `CALL SP_GET_DATABASE(${Fk_data})`;

            connection.query(SQLJoin, (error, rows) => {
                // Liberar la conexión y devolverla al pool
                connection.release();
                if (error) {
                    console.error(error);
                    return res.status(409).json({ error: 'Error del servidor' });
                }

                if (rows[0].length === 0) {
                    // Manejar resultados vacíos de la consulta
                    res.status(404).send('No se encontraron datos');
                    return;
                }

                let data = JSON.stringify(rows[0][0]);
                let parsedData;
                try {
                    parsedData = JSON.parse(data);
                } catch (err) {
                    console.error('Error analizando JSON: ' + err.stack);
                    res.status(500).send('Error interno del servidor (JSON)');
                    return;
                }

                let joinDatabase = parsedData.BASEDATOS;
                console.log(joinDatabase);

                res.json({ token, joinDatabase });
            });
        });
    });
});



router.post('/create', (req, res) => {
    let dbName = req.headers[process.env.HARD_HEADER];
    let rut = req.headers['rut_id'];

    const pool = mysql.createPool({
        connectionLimit: 10,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });
    const { NOMBRE, APELLIDO, CLAVE, ROL_ID, E_MAIL } = req.body;
    let activo = 1;

    // Obtener una conexión del pool
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return res.json('Error de Acceso');
        }

        connection.query('INSERT INTO USERS (NOMBRE, APELLIDO, CLAVE, ROL_ID, RUTEMP, E_MAIL, ACTIVO) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [NOMBRE, APELLIDO, CLAVE, ROL_ID, rut, E_MAIL, activo],
            (err, rows, fields) => {
                // Liberar el pool de conexiones
                connection.release();
                if (!err) {
                    // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
                    res.status(201).json('Usuario Creado Con Exito!!');
                } else {
                    // res.json('Error al Crear Usuario');
                    res.status(400).json('¡ERROR! No se pudo crear el Usuario');
                    console.log("El error es -> " + err.sqlMessage);
                }

            }
        )
    });
});

router.put('/edit/:id', (req, res) => {
    let dbName = req.headers[process.env.HARD_HEADER];
    let id = req.params.id;
    console.log('ESTE ES EL ID--' + id);
    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 10,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });
    const { NOMBRE, APELLIDO, CLAVE, ROL_ID, E_MAIL, ACTIVO } = req.body;
    let activo = 1;

    // Obtener una conexión del pool
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return res.json('Error de Acceso');
        }

        connection.query(`UPDATE USERS SET NOMBRE=?, APELLIDO=?, CLAVE=?, ROL_ID=?, E_MAIL=?, ACTIVO=? WHERE CODUSUARIO=?`,
            [NOMBRE, APELLIDO, CLAVE, ROL_ID, E_MAIL, ACTIVO, id],
            (err, rows, fields) => {
                //liberar Conexion
                connection.release();
                if (!err) {
                    // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
                    res.status(200).json('Usuario Actualizado Con Exito!!');
                } else {
                    // res.json('Error al Crear Usuario');
                    res.status(400).json('¡ERROR! No se pudo Actualizar el Usuario');
                    console.log("El error es -> " + err.sqlMessage);
                }

            }
        )
    });
});

router.get('/get/:id', (req, res) => {
    let dbName = req.headers[process.env.HARD_HEADER];
    let id = req.params.id;
    console.log('ESTE ES EL ID--' + id);
    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 10,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });

    // Obtener una conexión del pool
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return res.json('Error de Acceso');
        }

        connection.query(`SELECT * FROM USERS WHERE CODUSUARIO=?`,
            [id],
            (err, rows, fields) => {
                connection.release();
                if (!err) {
                    // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
                    // let data = JSON.stringify(rows[0]);
                    res.status(200).json(rows[0]);
                } else {
                    // res.json('Error al Crear Usuario');
                    res.status(400).json('¡ERROR! No se pudo Obtener el Usuario');
                    console.log("El error es -> " + err.sqlMessage);
                }
            }
        )
    });
});

router.get('/v1/obtener/usuarios', (req, res) => {
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

    // Obtener una conexión del pool
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return res.json('Error de Acceso');
        }

        connection.query('SELECT * from USERS where RUTEMP=?',
            [rut],
            (err, rows, fields) => {
                //Liberar pool de conexiones
                connection.release();
                if (!err) {
                    // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
                    res.json(rows);
                } else {
                    // res.json('Error al Crear Usuario');
                    res.status(500).json('¡ERROR! No hay Usuarios para Mostrar');
                    console.log("El error es -> " + err.sqlMessage);
                }

            }
        )
    });
});

router.post('/test', verifyToken, (req, res) => {
    res.json('Exito!! Informacion secreta');
});

function verifyToken(req, res, next) {
    if (!req.headers.authorization) return res.status(401).json('No autorizado');

    const token = req.headers.authorization.substr(7);
    if (token != "") {
        const content = jwt.verify(token, passJWT);
        req.data = content;
        next();
        console.log('Rut para BAse de Datos---> ' + process.env.DATAB2)
    } else {
        res.status(401).json('Token Vacio');
    }
}

router.get('/v1/get/roles', (req, res) => {
    let dbName = req.headers[process.env.HARD_HEADER];

    const pool = mysql.createPool({
        connectionLimit: 100,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });

    // Obtener una conexión del pool
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return res.json('Error de Acceso');
        }

        connection.query('SELECT ROL_ID FROM ROLUSERS',
            (err, rows, fields) => {
                connection.release();
                if (!err) {
                    // console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
                    res.json(rows);
                } else {
                    // res.json('Error al Crear Usuario');
                    res.status(500).json('¡ERROR! No hay Usuarios para Mostrar');
                    console.log("El error es -> " + err.sqlMessage);
                }

            }
        )
    });
});


module.exports = router;