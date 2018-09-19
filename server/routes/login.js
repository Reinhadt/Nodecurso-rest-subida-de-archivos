const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario')
const app = express()


app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }

        //si el usuario no existe:
        if(!usuarioDB){
            return res.status(400).json({
                ok: false,
                message: '(Usuario) o contraseña incorrectos'
            })
        }

        //comprobamos si la contraseña es correcta:
        if( !bcrypt.compareSync(body.password, usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                message: 'Usuario o contraseña incorrectos'
            })
        }

        //generamos el token(jwt).
        //se manda el payload(usuarioDB)
        //se manda el secret(cadena para que coincida server y cliente)
        //expiración, en este caso 30 días
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN})

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        })

    })
})

//configuraciones de Google:
async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return{
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

  }

app.post('/google', async(req, res) => {

    let token = req.body.idtoken

    let googleUser = await verify(token)
                        .catch( e => {
                            return res.status(403).json({
                                ok: false,
                                err: e
                            })
                        })

    
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if(usuarioDB){
            //Si el usuario ya se logueó con su correo y contraseña por medio del endpoint /login
            if(usuarioDB.google === false){
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "Este usuario ya existe. Use usuario y contraseña para ingresar normalmente."
                    }
                })
            }else{
                //Si el usuario tiene cuenta con nosotros y se logueó con google:
                //generamos el token(jwt).
                //se manda el payload(usuarioDB)
                //se manda el secret(cadena para que coincida server y cliente)
                //expiración, en este caso 30 días
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN})

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }
        }else{
            //Si el usuario no existen en la base de datos (es nuevo)
            let usuario = new Usuario()

            usuario.nombre = googleUser.nombre
            usuario.email = googleUser.email
            usuario.img = googleUser.img
            usuario.google = true
            usuario.password = ':)'

            usuario.save((err, usuarioDB)=> {
                
                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }
                
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN})

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                })
            })

        }

    })
})

module.exports = app;