import { Request, Response, NextFunction } from 'express';
import axios, { AxiosResponse } from 'axios';
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./sqlite.db', sqlite3.OPEN_READWRITE, (err: Error) => {
    if(err) return console.error(err.message);
})

interface User {
    id: Number;
    username: String;
    password: String;
}

// consulta um user
const getUser = async (req: Request, res: Response, next: NextFunction) => {
    // pega o id do usuário dos parametros da requisição
    const id: string = req.params.id;

    const sql = `SELECT * FROM users WHERE id = ${id}`;
    db.all(sql, [], (err: Error, rows: Array<any>) => {

        //Error Handling
        if(err){
            return res.status(500).json({message: err.message});
        }

        //Retorna o usuário
        return res.status(200).json({
            message: rows[0] ? "Ok." : "Nenhum usuário encontrado",
            usuario: rows ? rows[0] : null
        });
    })
};

// consulta um user
const authUser = async (req: Request, res: Response, next: NextFunction) => {
    // pega o username/senha do usuário dos parametros da requisição
    const username: string = req.params.username;
    const password: string = req.params.password;

    const sql = `SELECT * FROM users WHERE username = '${username}'`;
    db.get(sql, [], (err: Error, user: User) => {

        //Error Handling
        if(err){
            return res.status(500).json({message: "Erro interno ao autenticar o usuário."});
        }

        //Usuário não existe
        if(!user){
            return res.status(200).json({
                message: "Usuário não existe.",
                auth: false
            });
        }

        //Senha/usuário incompatíveis
        if(password != user.password){
            return res.status(200).json({
                message: "Usuário e/ou senha incorreto(s).",
                auth: false
            });
        }

        user.password = "";

        //Sucesso
        return res.status(200).json({
            message: "Autenticação realizada com sucesso.",
            auth: true,
            user: user
        });
    })
};

// registra um user
const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    // pega o username/senha do usuário do body da requisição
    const username: string = req.body.username;
    const password: string = req.body.password;
    
    if(!username || !password) return res.status(500).json({message: "Usuário e senha não podem ser nulos."});

    const sql = `INSERT INTO users (username, password) VALUES(?,?)`
    db.run(sql, [username, password], (err: Error) => {

        //Error Handling
        if(err){
            if(err.message.includes("UNIQUE")) err.message = "Este nome de usuário já existe.";
            return res.status(500).json({message: "Erro ao registrar novo usuário: " + err.message});
        }

        return res.status(200).json({message: "Novo usuário registrado com sucesso."});
    })
};


export default { getUser, authUser, registerUser };