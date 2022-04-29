import { Request, Response, NextFunction } from 'express';
import axios, { AxiosResponse } from 'axios';
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./sqlite.db', sqlite3.OPEN_READWRITE, (err: Error) => {
    if(err) return console.error(err.message);
})

interface Movimento {
    id: Number;
    userId: Number;
    tipoId: Number;
    descricao: String;
    valor: String;
    data: String;
}

// consulta o extrato de um user
const getExtrato = async (req: Request, res: Response, next: NextFunction) => {
    // pega o id do usuário dos parametros da requisição
    const userId: string = req.params.userId;

    const sql = `SELECT * FROM movimentos INNER JOIN tipos ON tipos.id = movimentos.tipo_id WHERE movimentos.user_id = '${userId}'`;
    db.all(sql, [], (err: Error, rows: Array<any>) => {

        //Error Handling
        if(err){
            return res.status(500).json({message: err.message});
        }

        //Retorna o extrato
        return res.status(200).json({
            message: rows.length ? "Ok." : "Nenhum registro encontrado.",
            extrato: rows
        });
    })
};

// registra um movimento financeiro do usuário
const addMovimento = async (req: Request, res: Response, next: NextFunction) => {
    // pega o user_id, tipo_id e valor do body da requisição
    const userId: string = req.body.userId;
    const tipoId: string = req.body.tipoId;
    const valor: string = req.body.valor;

    if(!userId || !tipoId || !valor) return res.status(500).json({message: "Os dados podem ser nulos."});

    const sql = `INSERT INTO movimentos (user_id, tipo_id, valor, data) VALUES(?,?,?, DATE('now'))`
    db.run(sql, [userId, tipoId, valor], (err: Error) => {
        //Error Handling
        if(err){
            return res.status(500).json({message: "Erro ao registrar movimento: " + err.message});
        }

        return res.status(200).json({message: "Novo movimento registrado com sucesso."});
    })
};

// deleta um movimento financeiro do usuário
const delMovimento = async (req: Request, res: Response, next: NextFunction) => {
    // pega o user_id, tipo_id e valor do body da requisição
    const userId: string = req.body.userId;
    const movimentoId: string = req.body.movimentoId;

    if(!userId || !movimentoId) return res.status(500).json({message: "Os dados podem ser nulos."});

    const sql = `DELETE FROM movimentos WHERE id = ${movimentoId}`;
    console.log(sql)
    db.run(sql, (err: Error) => {
        //Error Handling
        if(err){
            return res.status(500).json({message: "Erro ao excluir movimento: " + err.message});
        }

        return res.status(200).json({message: "Movimento excluído com sucesso."});
    })
};


export default { getExtrato, addMovimento, delMovimento };