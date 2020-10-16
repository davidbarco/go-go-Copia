const express = require('express');
const UserController = require('../controllers/user')
const mdAuth = require('../middlewares/authenticated')

const multipart = require('connect-multiparty')
const uploadImg = multipart({ uploadDir: './assets/users' })


const api = express.Router()

api.get('/probando-controlador', mdAuth.authUser, UserController.pruebas)
api.post('/register', UserController.create)
api.post('/login', UserController.login)
api.put('/update/:id', uploadImg, UserController.update)
api.post('/upload-image-user/:id', uploadImg, UserController.uploadImg)
api.get('/get-image-user/:imgUser', UserController.getImg)

module.exports = api;
