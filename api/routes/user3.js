const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Create a MySQL connection
const connection = require('../connection/connection');

const jwt = require('jsonwebtoken');

require('dotenv').config({path:'./.env'});


const passJWT = process.env.PWDJWT;
//console.log(passJWT)
const passDataBase = process.env.PWDATA;
//console.log('*********'+passDataBase);

router.post('/singin3', (req, res) =>{
    let dbName = req.headers[process.env.HARD_HEADER];
    console.log(dbName);
    // Create connection pool for MySQL
    const pool = mysql.createPool({
        connectionLimit: 10,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PWDATA,
        database: dbName  // default database
    });
    const { NOMBRE, CLAVE} = req.body;
    
    pool.query('SELECT NOMBRE, CLAVE, RUTEMP from USERS where NOMBRE=? AND CLAVE=?',
    [NOMBRE, CLAVE],
    (err, rows, fields) => {
        if (!err) {
            // if (!err && headers['client-secret'] == 'alfa$master')
            if (rows.length >0) {
                let data = JSON.stringify(rows[0]);

                var parsedData = JSON.parse(data);
                Fk_data = parsedData.RUTEMP;
                // console.log(Fk_data);
                
                const options = { expiresIn: '10h' };
                const token = jwt.sign(data, passJWT);
                res.json({token});
                // console.log("ESTE ES EL JOIN -> "+SQLJoin);
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


router.post('/test3', verifyToken, (req, res) => {
    res.json('Informacion secreta');
    console.log(Fk_data);
});

function verifyToken(req, res, next){
    if(!req.headers.authorization) return res.status(401).json('No autorizado');

    const token = req.headers.authorization.substr(7);
    if(token !=""){
        const content = jwt.verify(token, passJWT);
        req.data = content;
        next();
    }else{
        res.status(401).json('Token Vacio');
    }
}

router.post('/api/users', (req, res) => {
    const user = req.body;
  
    // Execute the first SQL statement to insert the user's details
    const SELECTUSER = `SELECT E_MAIL, CLAVE, RUTEMP from USER where E_MAIL='${user.E_MAIL}' AND CLAVE='${user.CLAVE}'`;
    connection.query(SELECTUSER, (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
      }
      let data1 = JSON.stringify(results[0]);
        var parsedData = JSON.parse(data1);
        let Fk_data = parsedData.RUTEMP;
        const datos = {data1};
        const options= { expiresIn: '10h' };
        const token = jwt.sign(datos, passJWT, options);
        
    
  
      // Execute the second SQL statement to retrieve the inserted user's details
      const SQLJoin = `SELECT BUSINESS.BASEDATOS FROM USER INNER JOIN BUSINESS ON BUSINESS.RUTEMP = USER.RUTEMP WHERE USER.RUTEMP='${Fk_data}'`
      connection.query(SQLJoin, (error, rows) => {
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

module.exports = router;