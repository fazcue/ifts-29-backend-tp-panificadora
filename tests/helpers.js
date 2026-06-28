import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import supertest from 'supertest'
import bcrypt from 'bcryptjs'

let mongoServer

export let request

// ─── Setup / teardown ──────────────────────────────────────

export const initTestEnvironment = async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()

    process.env.MONGO_URI = uri
    process.env.CLAVE_ALTA_PLANTA = 'clave-test'
    process.env.SESION_SECRETO = 'test-secret'
    process.env.JWT_SECRETO = 'test-jwt-secret'
    process.env.JWT_TIEMPO_EXPIRACION = '24h'

    await mongoose.connect(uri)

    const { default: app } = await import('../src/app.js')
    request = supertest(app)
}

export const destroyTestEnvironment = async () => {
    // Cerrar conexion del store de sesion (MongoStore)
    try {
        const { store } = await import('../src/config/session.js')
        if (store?.client) {
            await store.client.close()
        }
    } catch (_) { /* ignorar si ya esta cerrado */ }

    await mongoose.disconnect()
    await mongoServer.stop()
}

export const limpiarColecciones = async () => {
    const collections = mongoose.connection.collections
    for (const key in collections) {
        await collections[key].deleteMany({})
    }
}

// ─── Helpers para tests ────────────────────────────────────

export const crearActor = async (datos) => {
    const Actor = (await import('../src/models/Actor.js')).default
    return Actor.create({ password: bcrypt.hashSync(datos.password || '1234', 10), activo: true, ...datos })
}

export const loginComo = async (email, password) => {
    const res = await request.post('/').send({ email, password }).redirects(0)
    const cookie = res.headers['set-cookie']?.[0]?.split(';')[0]
    return { res, cookie }
}
