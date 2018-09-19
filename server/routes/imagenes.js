const express = require('express')
const  fs = require('fs')
const path = require('path')
const {verificaTokenImg} = require('../middlewares/autenticacion')
let app = express()

app.get('/img/:tipo/:img', verificaTokenImg, (req, res) => {
    
    let tipo = req.params.tipo
    let img = req.params.img


    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`)

    //si la imagen que necesitamos existe:
    //con existsSync lo comprobamos
    if(fs.existsSync(pathImagen)){
        res.sendFile(pathImagen)
    }else{
        let noImagePath =  path.resolve(__dirname, '../assets/assange.png')

        res.sendFile(noImagePath)
    }


})



module.exports = app