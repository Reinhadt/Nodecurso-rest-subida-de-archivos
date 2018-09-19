const express = require('express')
const bcrypt = require('bcrypt')
const _ = require('underscore')
const app = express()

const Usuario = require('../models/usuario')
const {verificaToken, verificaAdminRole} = require('../middlewares/autenticacion')

app.get('/usuario', verificaToken, (req, res) => {
    
    

    //paginación: desde dónde empezamos el query
    let desde = req.query.desde || 0
    desde = Number(desde)
    
    //en dónde terminamos el query
    let limite = req.query.limite || 5
    limite = Number(limite)

    
    //buscamos por usuarios activos
    Usuario.find({"estado":true},'nombre email role estado google img' ) // -> parámetro de qué campos quiero mostrar en el get
            .skip(desde) //desde donde se empieza el query(número). Cuántos se salta.
            .limit(limite) //en donde termina el query (en número). Cuántos va a mostar en total
            .exec( (err, usuarios) =>{
                if(err){
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }

                //contamos por usuarios activos
                Usuario.count({"estado":true}, (err, conteo) =>{
                    if(err){
                        return res.status(400).json({
                            ok: false,
                            err
                        })
                    }else{
                        res.json({
                            total:  conteo,
                            ok: true,
                            usuarios
                        })
                    }
                    
                })


            })
})

app.post('/usuario', [verificaToken, verificaAdminRole], (req, res) => {

    //req.body obtiene el body de x-www-form-urlencoded
    //o sea, data de formularios
    let body = req.body

    //Este es el paquetito que le voy a mandar a la base de datos
    let usuario = new Usuario({
        nombre: body.nombre,
        email:  body.email,
        //encriptamos con bcrypt. Primer arg: datos a encriptar, segundo arg: ciclos de encriptación a la data que mandamos
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    })

    //AQUÍ SE GUARDA EL OBJETO ENN LA BASE DE DATOS!!
    usuario.save( (err, usuarioDB) =>{
        if(err){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario:usuarioDB
        })
    })

})

app.put('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {
    let id = req.params.id

    //usamos underscore con su función pick
    //esto para evitar que el usuario pueda editar campos del objeto que no se deben poder actualizar
    //como password o si viene por google social login o lo que no queramos 
    //de esta manera evitamos que sea editado lo que no queremos
    //pick elige de un objeto los campos que queremos solamente :DD
    let body = _.pick(req.body, ["nombre", "email", "img", "role", "estado"])

    Usuario.findByIdAndUpdate( id, body, {new:true, runValidators: true}, (err, usuarioDB) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })
})

app.delete('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {
    
    //Para "borrar" un usuario, lo que haremos será cambiar su estado de true a false
    //esto porque en apps modernas no se borra el registro, más bien se conserva y se
    //desactiva para futuras referencias o relaciones de bases de datos

    let id = req.params.id

    //objeto para cambiar el estado del usuario
    let cambiaEstado = {
        estado:  false
    }

    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado)) ->>> para borrar usuario de la base de datos
    Usuario.findByIdAndUpdate( id, cambiaEstado, (err, usuarioBorrado) =>{
        if(err){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        //si el usuario borrado no existe o ya se borró antes:
        if(!usuarioBorrado ){
            return res.status(400).json({
                ok:false,
                err: {
                    message: 'Usuario no encontrado'
                }
            })
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        })
    })

})

module.exports = app;