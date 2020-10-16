const jwt = require('jwt-simple')
const moment = require('moment')
const secret = 'mi-clave-secreta'


exports.userToken = function(user){
    let payload = {
        sub: user._id,
        firstName: user.firstName,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix
    }

    return jwt.encode(payload, secret)
}