const express = require('express')
const app = express()
require('dotenv').config()
const db = require('./db_config')
const auth = require('./auth')

const jwt = require("jsonwebtoken");

app.use(express.json())

app.post('/register', (req, res) => {
    const {nama, username, password} = req.body

    if (!(nama && username && password)){
        res.status(400).send('Input harus dimasukan semua')
    }

    const token = jwt.sign(
        {
            username: username
        },
        process.env.TOKEN_KEY,
        {
            expiresIn: "2h"
        }
    )

    let sql = "INSERT INTO user VALUES(NULL, '"+ nama +"', '"+ username +"', '"+ password +"', '"+ token +"')"

    db.run(sql, (err) => {
        if (err) throw err;
        console.log('record success')
        res.send({'status': true, 'msg': 'Record User Success'})
    })

    db.close()
})


app.post('/login', (req, res) => {
    try {
        const { username, password } = req.body

        if (!(username && password)) {
            res.status(400).send('Input harus dimasukan semua')
        }

        let sql = "SELECT * FROM user WHERE username = ? AND password = ?"

        db.get(sql, [username, password], (err, row) => {
            if (err) throw err;

            if (row){
                const token = jwt.sign(
                    {username: row.username},
                    process.env.TOKEN_KEY,
                    {expiresIn: "2h"}
                )

                let sql_2 = "UPDATE user SET token='"+ token +"' WHERE username = ?"
                db.run(sql, [username], (err) => {
                    if (err) throw err;
                    res.status(200).json(row)
                })
            } else {
                res.status(400).send("Salah JWT")
            }
        })
    } catch (err) {
        console.log(err)
    }
})

app.post("/list-handphone", auth, (req ,res) => {
    let sql = "SELECT * FROM handphone"
    db.all(sql, (err, rows) => {
        if (err) throw err;
        if (rows.length > 0) {
            res.status(200).json(rows)
        } else {
            res.status(200).json({'status': true, 'msg': 'data tidak ada...'})
        }
    })
})

app.post("/add-new", auth, (req, res) => {
    const { nama_hp, jenis_hp, nomor_seri, tanggal_produksi } = req.body

    let sql = "INSERT INTO handphone VALUES(NULL, ?, ?, ?, ?)"

    db.run(sql, [nama_hp, jenis_hp, nomor_seri, tanggal_produksi], (err) => {
        if (err) throw err;
        res.status(200).json({'status': true, 'msg': 'record new 1'})
    })
})

app.post("/update-hp", auth, (req, res) => {
    const { id, nama_hp, jenis_hp, nomor_seri, tanggal_produksi } = req.body

    let sql = "UPDATE handphone SET nama_hp = ?, jenis_hp = ?, nomor_seri = ?, tanggal_produksi = ? WHERE id = ?"
    db.run(sql, [nama_hp, jenis_hp, nomor_seri, tanggal_produksi, id], (err) => {
        if (err) throw err;
        res.status(200).json({'status': true, 'msg': 'updated 1'})
    })
})

app.post("/delete-hp", auth, (req, res) => {
    const {id} = req.body

    let sql = "DELETE FROM handphone WHERE id = ?"
    db.run(sql, [id], (err) => {
        if (err) throw err;

        res.status(200).json({'status': true, 'msg': 'deleted 1'})
    })
})



module.exports = app