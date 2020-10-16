const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt-nodejs')
const User = require('../models/user')
const jwt = require('../services/jwt')


function pruebas(req, res) {
    res.status(200).send({
        message: 'Nos está funcionando el controlador'
    })
}



//Función para crear un usuario

function create(req, res) {
    let user = new User()

    let params = req.body

    user.firstName = params.firstName
    user.lastname = params.lastname
    user.email = params.email.toLowerCase()
    /* user.role = 'ROLE_USER' */
    user.image = 'null'

    if (params.password) {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                console.log(err)
            } else {
                bcrypt.hash(params.password, salt, null, function (err, hash) {
                    user.password = hash
                    if (user.firstName != null && user.lastname != null && user.email != null) {
                        User.findOne({ email: user.email }, (err, userEmail) => {
                            if (userEmail) {
                                console.log("Ya existe")
                                res.status(200).send({ message: "El correo ya existe" })
                            } else {
                                user.save((err, userStored) => {
                                    if (err) {
                                        res.status(500).send({ message: 'Error al guardar usuario' })
                                    } else {
                                        if (!userStored) {
                                            res.status(404).send({ message: 'No se ha registrado el usuario' })
                                        } else {
                                            res.status(200).send({ user: userStored })
                                        }
                                    }
                                })
                            }
                        })

                    }
                })
            }
        })
    } else {
        res.status(200).send({ message: 'Introduce la contraseña' })
    }
}


//funcion para logearse , despues de crear el usuario

function login(req, res) {
    let params = req.body;
    let email = params.email
    let pass = params.password


    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
            res.status(500).send({ message: 'Error en la petición' })
        } else {
            if (!user) {
                res.status(404).send({ message: 'El usuario no existe' })
            } else {
                bcrypt.compare(pass, user.password, function (err, check) {
                    if (check) {
                        if (params.gethash) {
                            res.status(200).send({
                                token: jwt.userToken(user)
                            })
                        } else {
                            res.status(200).send({ token: jwt.userToken(user) })
                        }
                    } else {
                        res.status(404).send({ message: 'El usuario no ha podido logearse' })
                    }
                })
            }
        }
    })
}


//actualizar usuario.

function update(req, res) {
    const userId = req.params.id
    let paramsBody = req.body

    if (req.files.image) {
        let routeImage = req.files.image.path;
        let splitImage = routeImage.split('\\');
        /**
         * ['/uplopad', 'image', 'nombreArchivo']
         */
        paramsBody.image = splitImage[splitImage.length - 1];
    }

    if (paramsBody.password) {
        bcrypt.hash(paramsBody.password, null, null, function (err, hash) {
            paramsBody.password = hash
            console.log(paramsBody.password)
            User.findByIdAndUpdate(userId, paramsBody, (err, userUpdated) => {
                if (err) {
                    res.status(500).send({ message: 'Error al actualizar usuario' })
                } else {
                    if (!userUpdated) {
                        res.status(404).send({ message: 'No se ha podido actualizar el usuario' })
                    } else {
                        res.status(200).send({ user: userUpdated })
                    }
                }
            })
        })
    } else {
        //{ new: true } => Permite obtener los datos actualizados del usuario.
        User.findByIdAndUpdate(userId, paramsBody, { new: true }, (err, userUpdated) => {
            if (err) {
                res.status(500).send({ message: 'Error al actualizar usuario' })
            } else {
                if (!userUpdated) {
                    res.status(404).send({ message: 'No se ha podido actualizar el usuario' })
                } else {
                    res.status(200).send({ token: jwt.userToken(userUpdated) })
                }
            }
        })
    }
}


//cargar imagen

function uploadImg(req, res)  {
    const userId = req.params.id

    if (req.files) {
        /* Sigue funcionando igual, capturamos la propiedad files para acceder a sus metodos, con la diferencia que como connect-multiparty genera un hash para el nombre ya no usamos la propiedad req.files.image.name para acceder al nombre porque nos daría el nombre con el que subimos (ej: "default.jpg") y necesitamos es que se guarde con el nombre hasheado, entonces accedemos al nombre por medio del path al que se subio en la carpeta de './assets/users',luego si se verifica la extensión y el procedimiento es igual, excepto que ya la imagen no se sube por acá, se sube por el archivo de routes, por medio del middleware. Revisen los console log que quedan ahi para que sepan que devuelve cada uno*/
        console.log("req.files -->", req.files)
        const userImage = req.files.image.path
        console.log("userImage -->", userImage)
        const imageSplit = userImage.split('\/')
        console.log("imageSplit -->", imageSplit)
        const nameImg = imageSplit[imageSplit.length - 1]
        console.log("nameImg -->", nameImg)
        const extImgSplit = nameImg.split('\.')
        console.log("extImgSplit -->", extImgSplit)
        const extImg = extImgSplit[1]
        console.log("extImg -->", extImg)

        if (extImg == 'png' || extImg == 'jpg') {
            User.findByIdAndUpdate(userId, { image: nameImg }, (err, user) => {
                if (err) {
                    res.status(500).send({ message: 'No se ha podido subir la imagen' })
                } else {
                    if (!user) {
                        res.status(404).send({ message: 'No se encontró ningún usuario' })
                    } else {
                        res.status(200).send({ user })
                    }
                }
            })
        } else {
            res.status(200).send({ message: 'La extensión no es correcta' })
        }
    } else {
        res.status(400).send({ message: 'No se ha subido ninguna imagen' })
    }
}


function getImg(req, res) {
    const imgUser = req.params.imgUser

    const imgRoute = `./assets/users/${imgUser}`

    fs.stat(imgRoute, function (exists) {
        if (exists) {
            res.sendFile(path.resolve(imgRoute))
        } else {
            res.status(200).send({ message: 'No existe la imagen' })
        }
    })
}




module.exports = {
    pruebas,
    create,
    login,
    update,
    uploadImg,
    getImg
}