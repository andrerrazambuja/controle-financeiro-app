/** source/server.ts */
import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';
const path = require('path');

const sqlite3 = require('sqlite3').verbose();

import auth from './routes/auth';
import finance from './routes/finance';

//#region DATABASE
const db = new sqlite3.Database('./sqlite.db', sqlite3.OPEN_READWRITE, (err: Error) => {
    if(err) return console.error(err.message);
})

db.run(`CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY UNIQUE,
            username UNIQUE NOT NULL,
            password NOT NULL
        )`);

// const sql = `INSERT INTO users (username, password) VALUES(?,?)`
// db.run(sql, ['andre', '123'], (err: Error) => {
//     if(err) return console.error(err.message);
//     console.log("Uma linha foi adicionada com sucesso.")    
// })

// const sqlSel1 = `SELECT * FROM users`
// db.all(sqlSel1, [], (err: Error, rows: Array<any>) => {
//     if(err) return console.error(err.message);
//     console.log('--------------')
//     rows.forEach(row => console.log(row));
// })

db.run(`CREATE TABLE IF NOT EXISTS tipos(
            id INTEGER PRIMARY KEY UNIQUE,
            descricao TEXT NOT NULL
        )`);

// const sql = `INSERT INTO tipos (descricao) VALUES(?)`
// db.run(sql, ['Transporte'], (err: Error) => {
//     if(err) return console.error(err.message);
//     console.log("Uma linha foi adicionada com sucesso.")    
// })

// const sqlSel2 = `SELECT * FROM tipos`
// db.all(sqlSel2, [], (err: Error, rows: Array<any>) => {
//     if(err) return console.error(err.message);
//     console.log('--------------')
//     rows.forEach(row => console.log(row));
// })

// db.run(`drop table movimentos`)

db.run(`CREATE TABLE IF NOT EXISTS movimentos(
            movimento_id INTEGER PRIMARY KEY,
            user_id INTEGER NOT NULL,
            tipo_id INTEGER NOT NULL,
            valor REAL NOT NULL,
            data TEXT
        )`);

// const sql = `INSERT INTO movimentos (user_id, tipo_id, valor, data) VALUES(?,?,?, DATE('now'))`
// db.run(sql, [1,1,500], (err: Error) => {
//     if(err) return console.error(err.message);
//     console.log("Uma linha foi adicionada com sucesso.")    
// })

// const sqlSel3 = `SELECT * FROM movimentos INNER JOIN tipos ON tipos.id = movimentos.tipo_id`
// db.all(sqlSel3, [], (err: Error, rows: Array<any>) => {
//     if(err) return console.error(err.message);
//     console.log('--------------')
//     rows.forEach(row => console.log(row));
// })




db.close((err: Error) => {
    if(err) return console.error(err.message);
})
//#endregion

//#region SERVER API
const router: Express = express();

router.use(express.static(path.resolve(__dirname, '../client/public/')));
router.use(morgan('dev'));
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.use((req, res, next) => {
    // set the CORS policy
    res.header('Access-Control-Allow-Origin', '*');
    // set the CORS headers
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type, Accept, Authorization');
    // set the CORS method headers
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
        return res.status(200).json({});
    }
    next();
});

/** Rotas da autenticação do usuario */
router.use('/auth/', auth);

router.use('/', finance);

// router.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../client/views', 'index.html'));
// })



/** Error handling */
router.use((req, res, next) => {
    const error = new Error('not found');
    return res.status(404).json({
        message: error.message
    });
});

const httpServer = http.createServer(router);
const PORT: any = process.env.PORT ?? 6060;
httpServer.listen(PORT, () => console.log(`Server rodando na porta ${PORT}`));
//#endregion