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



router.post('/singin', (req, res) => {
    const user = req.body;
  
    // Execute the first SQL statement to insert the user's details
    const QUERY_SELECT_USER = `SELECT E_MAIL, CLAVE, RUTEMP from USER where E_MAIL='${user.E_MAIL}' AND CLAVE='${user.CLAVE}'`;
    
    mysqlConnection.query(QUERY_SELECT_USER, (error, results) => {
        if (error) {
            // Handle database errors
            console.error('Error connecting to database: ' + error.stack);
            res.status(500).send('Internal server error');
            return;
          }

        if (results.length === 0) {
        // Handle incorrect login credentials
        res.status(401).send('Incorrect username or password');
        return;
        }

        let data1 = JSON.stringify(results[0]);
        var parsedData = JSON.parse(data1);
        let Fk_data = parsedData.RUTEMP;
        const datos = {data1};
        const options= { expiresIn: '10h'};
        const token = jwt.sign(datos, passJWT, { expiresIn: '20s' });

      // Execute the second SQL statement to retrieve the inserted user's details
      const SQLJoin = `SELECT BUSINESS.BASEDATOS FROM USER INNER JOIN BUSINESS ON BUSINESS.RUTEMP = USER.RUTEMP WHERE USER.RUTEMP='${Fk_data}'`
      mysqlConnection.query(SQLJoin, (error, rows) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: 'Server error' });
        }
  
        //res.json(rows[0]); // Return the inserted user's details as a response
        let data = JSON.stringify(rows[0]);

        var parsedData = JSON.parse(data);
        let joinDatabase = parsedData.BASEDATOS;
        console.log(joinDatabase);

        res.json({token, joinDatabase});
      });
    });
  });

  router.post('/singin2', (req, res) =>{
    let dbName = req.headers[process.env.HARD_HEADER];
    //console.log(dbName);
    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 100,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });
    const {CLAVE} = req.body;
    
    pool.query('SELECT NOMBRE, CLAVE, RUTEMP, ROL_ID from USERS where CLAVE=?',
    [CLAVE],
    (err, rows, fields) => {
        if (!err) {
            if (rows.length >0) {
                let data = JSON.stringify(rows[0]);

                var parsedData = JSON.parse(data);
                // Fk_data = parsedData.RUTEMP;
                // console.log(Fk_data);

                const datos = {parsedData};
                const options = { expiresIn: '10h' };
                const token = jwt.sign(datos, passJWT, options);
                // const token = jwt.sign(datos, passJWT, { expiresIn: '20s' });
                //res.json({token});
                res.json({token, parsedData});
            } else {
                res.json('Usuario ó Clave incorrectos');
            }
        } else {
            res.json('Error de Acceso');
            console.log(err);
        }
    }
    )
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
    const { NOMBRE, APELLIDO, CLAVE, ROL_ID} = req.body;
    
    pool.query('INSERT INTO USERS (NOMBRE, APELLIDO, CLAVE, ROL_ID, RUTEMP) VALUES (?, ?, ?, ?, ?)',
    [NOMBRE, APELLIDO, CLAVE, ROL_ID, rut],
    (err, rows, fields) => {
        if (!err) {
            console.log(res.statusCode=201, res.json("Usuario Creado Con Exito!!"));
        } else {
            res.json('Error al Crear Usuario');
            console.log("El error es -> "+ err.sqlMessage);
        }
    }
    )
});

router.post('/test', verifyToken, (req, res) => {
    res.json('Exito!! Informacion secreta');
});

function verifyToken(req, res, next){
    if(!req.headers.authorization) return res.status(401).json('No autorizado');

    const token = req.headers.authorization.substr(7);
    if(token !=""){
        const content = jwt.verify(token, passJWT);
        req.data = content;
        next();
        console.log('Rut para BAse de Datos---> '+process.env.DATAB2)
    }else{
        res.status(401).json('Token Vacio');
    }
}


module.exports = router;