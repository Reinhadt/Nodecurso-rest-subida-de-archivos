const mongoose = require('mongoose')
//para validar valores duplicados o no válidos y mandar errores amistosos
const uniqueValidator = require('mongoose-unique-validator')

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
}

let Schema = mongoose.Schema

let usuarioSchema =  new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        require: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true,  'Es obligatorio el password']
    },
    img: {
        type: String,
        required: false
    }, //no obligatoria
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    }, //obligatoria, default: 
    estado: {
        type: Boolean,
        default: true
    }, //boolean
    google: {
        type: Boolean,
        default: false
    }
})

//para devolver el objeto(schema) completo a excepción del password
//esto para métodos get o bien respuestas en post
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject()
    delete userObject.password

    return userObject
}

usuarioSchema.plugin(uniqueValidator, {message: '{PATH} debe de ser único'})

module. exports =  mongoose.model('Usuario', usuarioSchema)