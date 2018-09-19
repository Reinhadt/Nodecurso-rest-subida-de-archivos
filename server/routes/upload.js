const express = require('express')
const fileUpload = require('express-fileupload')
const app = express()

const Usuario = require('../models/usuario')
const Producto = require('../models/producto')

const fs = require('fs')
const path = require('path')

app.use(fileUpload())

app.put('/upload/:tipo/:id', (req, res) => {

	let tipo = req.params.tipo
	let id = req.params.id

    if(!req.files){
		return  res.status(400)
                    .json({
                        ok: false,
                        err: {
                            message: 'No se ha seleccionado ningún archivo'
                        }
                    })

	}

	//valida tipo
	let tiposValidos = ['productos', 'usuarios']
	
	if(tiposValidos.indexOf<0){
		return res.status(400).json({
			ok: false,
			err:{
				message: 'Las tipos permitidas son: ' + tiposValidos.join(',')
			}
		})
	}

    let sampleFile = req.files.archivo

	let nombreArchivo = sampleFile.name.split('.')
	let extension = nombreArchivo[nombreArchivo.length-1]			

    //Extensiones válidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];


	if(extensionesValidas.indexOf(extension)<0){
		return res.status(400).json({
			ok: false,
			err:{
				message: 'Las extensiones permitidas son: ' + extensionesValidas.join(',')
			}
		})
	}

	//Cambiar nombre del archivo
	let nombreArchivoCambiado = `${id}-${new Date().getMilliseconds()}.${extension}`
	console.log('archivo: '+nombreArchivoCambiado)

	if(tipo === 'usuarios'){
		sampleFile.mv(`uploads/${tipo}/${nombreArchivoCambiado}`, (err)=>{
			if(err){
				return  res.status(500)
				.json({
					ok: false,
					err
				})
			}else{
				imagenUsuario(id, res, nombreArchivoCambiado)	
			}
		})
	}else if(tipo==='productos'){
		sampleFile.mv(`uploads/${tipo}/${nombreArchivoCambiado}`, (err)=>{
			if(err){
				return  res.status(500)
				.json({
					ok: false,
					err
				})
			}else{
				imagenProducto(id, res, nombreArchivoCambiado)	
			}
		})
	}
    

})

function imagenUsuario(id, res, nombreArchivoCambiado){
	Usuario.findById(id, (err, usuarioDB) =>{
		if(err){
			borraArchivo(nombreArchivoCambiado, 'usuarios')
			return res.status(500).json({
				ok: false,
				err
			})
		}
		if(!usuarioDB){
			borraArchivo(nombreArchivoCambiado, 'usuarios')
			return res.status(400).json({
				ok: false,
				err: {
					message: 'Usuario no existe'
				}
			})
		}

		//si el usuario setea dos veces su imagen
		//esto por si el usuario setea su imagen para evitar duplicados
		borraArchivo(usuarioDB.img, 'usuarios')

		usuarioDB.img = nombreArchivoCambiado

		usuarioDB.save((err,usuarioGuardado) => {
			if(err){
				borraArchivo(nombreArchivoCambiado, 'usuarios')
				return res.status(500).json({
					ok: false,
					err
				})
			}
			res.json({
				ok: true,
				usuario: usuarioGuardado,
				img: nombreArchivoCambiado
			})
		})

	})
}

function imagenProducto(id, res, nombreArchivoCambiado){
	Producto.findById(id, (err, productoDB) =>{
		if(err){
			borraArchivo(nombreArchivoCambiado, 'productos')
			return res.status(500).json({
				ok: false,
				err
			})
		}
		if(!productoDB){
			borraArchivo(nombreArchivoCambiado, 'productos')
			return res.status(400).json({
				ok: false,
				err: {
					message: 'Producto no existe'
				}
			})
		}

		//si el usuario setea dos veces su imagen
		//esto por si el usuario setea su imagen para evitar duplicados
		borraArchivo(productoDB.img, 'productos')

		productoDB.img = nombreArchivoCambiado

		productoDB.save((err,productoGuardado) => {
			if(err){
				borraArchivo(nombreArchivoCambiado, 'usuarios')
				return res.status(500).json({
					ok: false,
					err
				})
			}
			res.json({
				ok: true,
				producto: productoGuardado,
				img: nombreArchivoCambiado
			})
		})

	})
}

function borraArchivo(nombreImagen, tipo){
	let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`)

	if(fs.existsSync(pathImagen)){
		fs.unlinkSync(pathImagen)
	}
}
module.exports = app