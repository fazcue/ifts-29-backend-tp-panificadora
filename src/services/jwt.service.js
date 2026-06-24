import jwt from 'jsonwebtoken'

const generarToken = (usuario) => {
    return jwt.sign(
        { id: usuario._id, email: usuario.email, tipo: usuario.tipo },
        process.env.JWT_SECRETO,
        { expiresIn: process.env.JWT_TIEMPO_EXPIRACION || '24h' },
    )
}

const verificarToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRETO)
}

export { generarToken, verificarToken }
