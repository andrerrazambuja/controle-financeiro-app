/** source/server.ts */
import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';

const sqlite3 = require('sqlite3').verbose();

import auth from './routes/auth';
import finance from './routes/finance';

//#region DATABASE
const db = new sqlite3.Database('./sqlite.db', sqlite3.OPEN_READWRITE, (err: Error) => {
    if(err) return console.error(err.message);
    console.log("Sucesso na conexão com o banco SQLite.")    
})

// db.run(`CREATE TABLE users(
//     id INTEGER PRIMARY KEY UNIQUE,
//     username UNIQUE NOT NULL,
//     password NOT NULL
// )`);

// const sql = `INSERT INTO users (username, password) VALUES(?,?)`
// db.run(sql, ['andre', '123'], (err: Error) => {
//     if(err) return console.error(err.message);
//     console.log("Uma linha foi adicionada com sucesso.")    
// })

const sql = `SELECT * FROM users`
db.all(sql, [], (err: Error, rows: Array<any>) => {
    if(err) return console.error(err.message);
    rows.forEach(row => console.log(row));
})

db.close((err: Error) => {
    if(err) return console.error(err.message);
})
//#endregion

//#region SERVER API
const router: Express = express();

router.use(morgan('dev'));
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.use((req, res, next) => {
    // set the CORS policy
    res.header('Access-Control-Allow-Origin', '*');
    // set the CORS headers
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
    // set the CORS method headers
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST');
        return res.status(200).json({});
    }
    next();
});

/** Rotas da autenticação do usuario */
router.use('/auth/', auth);

router.use('/', finance);


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