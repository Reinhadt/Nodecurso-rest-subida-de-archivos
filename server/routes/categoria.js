const express = require('express')

let {verificaToken, verificaAdminRole} = require('../middlewares/autenticacion')

let app = express()

let Categoria = require('../models/categoria')

//
// MOSTRAR TODAS LAS CATEGORÍAS
//
app.get('/categoria', (req, res) => {

    Categoria.find({})
            //ordenar por descripcion
            .sort('descripcion')
            //Obtener 'referencia cruzada' a colección de usuarios (se obtiene el usuario que creó la categoría :DDD)
            .populate('usuario', 'nombre email')
            .exec((err, categorias) => {
                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }

                res.json({
                    ok:true,
                    categorias
                })

            })

})

//
// MOSTRAR CATEGORÍA POR ID
//
app.get('/categoria/:id', (req, res) => {
    let id = req.params.id 

    Categoria.findById(id, (err, categoriaDB)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err:{
                    message: "La categoría no existe"
                }
            })
        }

        res.json({
            ok: true,
            categoriaDB
        })

    })

})


//
// Crear nueva categoría
//
//Es necesario estar logueado para usar esta ruta con el middleware verificaToken
app.post('/categoria', verificaToken, (req, res) => {
    //Requiero el body que se manda por post
    let body = req.body

    //Aquí hago instancia del modelo categoría para llenar 
    //los campos requeridos en el Schema de mongoose
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    })

    //Usamos el método save de mongoose con los datos
    categoria.save((err, categoriaDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            })
        }
        
        // Si todo salió bien, mandamos ok y la categoría nueva creada
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })

})

//
// Modificar una categoría
//
app.put('/categoria/:id', verificaToken, (req, res) => {
    
    //Pido el id y lo que contenga el body
    let id = req.params.id
    let body = req.body

    //Creo un objeto con la descripción a mandar por PUT
    let descCategoria = {
        descripcion: body.descripcion
    }

    //Uso find by id and update de mongoose con 
    //runValidators y new: true
    Categoria.findByIdAndUpdate(id, descCategoria, {new:true, runValidators: true}, (err, categoriaDB)=> {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            })
        }
        
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })

})

//
// Borrar categoría
//
//Es requerido ser administrador y verificar el token:
app.delete('/categoria/:id', [verificaToken, verificaAdminRole],  (req, res) => {
    //solo un admin puede borrar cats
    //Categoría.findByIdAndRemove

    let id = req.params.id 

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: "El id no existe"
                }
            })
        }
        
        res.json({
            ok: true,
            message: 'Categoría borrada'
        })
    })

})

module.exports = app