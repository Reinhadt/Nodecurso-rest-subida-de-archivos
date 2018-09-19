//=====================
//PUERTO
//=====================
process.env.PORT = process.env.PORT || 5000


//=====================
//ENTORNO
//=====================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//=====================
//VENCIMIENTO DEL TOKEN
//=====================
process.env.CADUCIDAD_TOKEN = '48h'

//=====================
//SEED DE AUTENTICACIÓN
//=====================
//cargo el seed también en heroku. El seed de heroku debe ser diferente a este que
//es solo para desarrollo('mi-seed-de-desarrollo')
//process.env.SEED es la config var dentro de heroku!!
process.env.SEED = process.env.SEED || 'mi-seed-de-desarrollo'


//=====================
//BASES DE DATOS
//=====================
if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe'
}else{
    urlDB = process.env.MONGO_URI
}

process.env.URLDB = urlDB

//=====================
//GOOGLE CLIENT ID
//=====================
process.env.CLIENT_ID = process.env.CLIENT_ID || '257544919474-ujoetd1hg0vmruq7ia1sn6o69fu74m7p.apps.googleusercontent.com'