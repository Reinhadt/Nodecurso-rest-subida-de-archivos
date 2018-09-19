const jwt = require('jsonwebtoken')

//=======================
//VERIFICAR TOKEN
//=======================
let verificaToken = (req, res, next) => {
    
    let token = req.get('token')

    //con verify nos aseguramos que los valores del token coincidan
    //con el seed y la expiración
    jwt.verify( token, process.env.SEED, (err, decoded) => {
        if(err){
            return res.status(401).json({
                ok: false,
                err
            })
        }

        req.usuario = decoded.usuario
        next()
    })
}
//=======================
//VERIFICAR SI ES ADMIN
//=======================
let verificaAdminRole = (req, res, next) => {
    let usuario = req.usuario;
    
    if(usuario.role === "ADMIN_ROLE"){
        next()
    }else{
        return res.json({
            ok: false,
            err: {
                message: "Debe ser administrador para editar, crear o eliminar usuarios"
            }
        })
    }
}

//=======================
//VERIFICAR TOKEN IMG
//=======================
let verificaTokenImg = (req, res, next) => {
    
    let token = req.query.token

    jwt.verify( token, process.env.SEED, (err, decoded) => {
        if(err){
            return res.status(401).json({
                ok: false,
                err
            })
        }

        req.usuario = decoded.usuario
        next()
    })


}
module.exports = {
    verificaToken,
    verificaAdminRole,
    verificaTokenImg
}