require('./config/config')

const express = require('express')
const mongoose = require('mongoose')
const app = express()
const bodyParser = require('body-parser');
const path = require('path')

//Config de bodyParser
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

//Hablilitar carpeta public
app.use(express.static(path.resolve(__dirname, '../public')))

app.use(require('./routes/index'))

mongoose.connect(process.env.URLDB, (err, res) =>{
    if(err) throw err;
    console.log('ROCANROLDB')
});

app.listen(process.env.PORT, () => {
    console.log("ROCANROL")
})