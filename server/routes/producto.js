const express = require('express')
let {verificaToken, verificaAdminRole} = require('../middlewares/autenticacion')

let app = express()
let Producto = require('../models/producto')

//
// MOSTRAR TODAS LOS PRODUCTOS
//
app.get('/producto', (req, res) => {

    //paginación, desde qué número de producto necesitamos
    let desde = req.query.desde || 0
    desde = Number(desde)

    Producto.find({"disponible": true}) //así busca sólo por prouctos con estatus disponible
        .skip(desde)
        //limita a máximo 5 productos por query
        .limit(5)
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

app.get('/producto/:id', (req, res) => {

    let id = req.params.id;

    Producto.findById(id) 
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if(!productoDB){
            return res.status(400).json({
                ok: false,
                err:{
                    message: "El producto no existe"
                }
            })
        }
        res.json({
            ok: true,
            productoDB
        })
    })

})

//
// Buscar Productos por un término
//
app.get('/producto/buscar/:termino', verificaToken, (req, res) =>{

    let termino = req.params.termino

    let regex = new RegExp(termino, 'i')

    Producto.find({'nombre': regex})
            .populate('categoria', 'nombre')
            .exec( (err, productos)=> {

                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }

                res.json({
                    ok: true,
                    productos
                })

            })
})

//
// Crear nuevo producto
//
app.post('/producto', verificaToken, (req, res) => {
    
    let body = req.body

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: true,
        categoria: body.categoria,
        usuario: req.usuario._id
    })

    producto.save((err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if(!productoDB){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            producto: productoDB
        })

    })
})



app.put('/producto/:id', verificaToken, (req,res)=>{
    let id = req.params.id
    let body = req.body

    let charProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria
    }

    Producto.findByIdAndUpdate(id, charProducto, {new:true, runValidators:true}, (err, productoDB)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if(!productoDB){
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            producto: productoDB
        })
    })

})

app.delete('/producto/:id', [verificaToken, verificaAdminRole],  (req, res) => {
    //solo un admin puede borrar cats
    //Categoría.findByIdAndRemove

    let id = req.params.id 

    let borrado = {
        disponible: false
    }

    Producto.findByIdAndUpdate( id, borrado, (err, productoBorrado) =>{
        if(err){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        //si el producto borrado no existe o ya se borró antes:
        if(!productoBorrado ){
            return res.status(400).json({
                ok:false,
                err: {
                    message: 'Usuario no encontrado'
                }
            })
        }

        res.json({
            ok: true,
            productoBorrado,
            message: 'Producto Borrado'
        })
    })

})

module.exports = app