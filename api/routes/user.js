const express = require('express');
const router = express.Router();

const mysqlConnection = require('../connection/connection');

const jwt = require('jsonwebtoken');

require('dotenv').config({path:'./.env'});

const passJWT = process.env.PWDJWT;
//console.log(passJWT)
const passDataBase = process.env.PWDATA;
console.log('*********'+passDataBase);

router.get(process.env.PASSMAXI, (req, res) =>{
    mysqlConnection.query('SELECT * FROM USER',  (err, rows, fields) =>{
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
});

router.post('/singin', (req, res) =>{
    console.log(req.body);
    const { E_MAIL, CLAVE} = req.body;
    mysqlConnection.query('SELECT E_MAIL, CLAVE from USER where E_MAIL=? AND CLAVE=?',
    [E_MAIL, CLAVE],
    (err, rows, fields) => {
        if (!err) {
            if (rows.length >0) {
                let data = JSON.stringify(rows[0]);
                const token = jwt.sign(data, passJWT);
                res.json({token});
            } else {
                res.json('Usuario ó Clave incorrectos');
            }
        } else {
            console.log(err);
        }
    }
    )
});

router.post('/test', verifyToken, (req, res) => {
    res.json('Informacion secreta');
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

module.exports = router;