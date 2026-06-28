import { initTestEnvironment, destroyTestEnvironment, limpiarColecciones, request, crearActor } from '../helpers.js'
import { TIPOS_ACTOR } from '../../src/lib/tiposActor.js'
import mongoose from 'mongoose'

let token

beforeAll(async () => {
    await initTestEnvironment()
    await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
    const res = await request.post('/api/login').send({ email: 'p@c.com', password: '1234' })
    token = res.body.token
}, 30000)

afterAll(destroyTestEnvironment, 30000)
beforeEach(limpiarColecciones)

const auth = () => `Bearer ${token}`

describe('API /api/actores', () => {
    test('GET / lista actores', async () => {
        await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })

        const res = await request.get('/api/actores').set('Authorization', auth())

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
        expect(res.body.some(a => a.email === 'f@c.com')).toBe(true)
    })

    test('GET /:id devuelve un actor', async () => {
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })

        const res = await request.get(`/api/actores/${fran._id}`).set('Authorization', auth())

        expect(res.status).toBe(200)
        expect(res.body.email).toBe('f@c.com')
    })

    test('GET /:id 404 si no existe', async () => {
        const res = await request.get(`/api/actores/${new mongoose.Types.ObjectId()}`).set('Authorization', auth())

        expect(res.status).toBe(404)
    })

    test('POST / crea un actor', async () => {
        const res = await request
            .post('/api/actores')
            .set('Authorization', auth())
            .send({ nombre: 'Nuevo', email: 'nuevo@c.com', password: '123456', tipo: TIPOS_ACTOR.FRANQUICIA })

        expect(res.status).toBe(201)
        expect(res.body.email).toBe('nuevo@c.com')
    })

    test('POST / rechaza email duplicado (409)', async () => {
        await crearActor({ nombre: 'Existente', email: 'dup@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })

        const res = await request
            .post('/api/actores')
            .set('Authorization', auth())
            .send({ nombre: 'Otro', email: 'dup@c.com', password: '123456', tipo: TIPOS_ACTOR.FRANQUICIA })

        expect(res.status).toBe(409)
        expect(res.body.error).toContain('email')
    })

    test('PUT /:id actualiza un actor', async () => {
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })

        const res = await request
            .put(`/api/actores/${fran._id}`)
            .set('Authorization', auth())
            .send({ nombre: 'Fran Actualizado', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })

        expect(res.status).toBe(200)
        expect(res.body.nombre).toBe('Fran Actualizado')
    })

    test('DELETE /:id elimina un actor', async () => {
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })

        const res = await request
            .delete(`/api/actores/${fran._id}`)
            .set('Authorization', auth())

        expect(res.status).toBe(200)
        expect(res.body.nombre).toBe('Fran')
        const Actor = (await import('../../src/models/Actor.js')).default
        expect(await Actor.findById(fran._id)).toBeNull()
    })
})
