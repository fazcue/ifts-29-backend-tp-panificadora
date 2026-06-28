import { initTestEnvironment, destroyTestEnvironment, limpiarColecciones, request, crearActor } from '../helpers.js'
import { TIPOS_ACTOR } from '../../src/lib/tiposActor.js'

beforeAll(initTestEnvironment, 30000)
afterAll(destroyTestEnvironment, 30000)
beforeEach(limpiarColecciones)

describe('POST /api/login', () => {
    test('credenciales validas devuelve token', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })

        const res = await request.post('/api/login').send({ email: 'p@c.com', password: '1234' })

        expect(res.status).toBe(200)
        expect(res.body.token).toBeDefined()
        expect(res.body.usuario).toBeDefined()
        expect(res.body.usuario.email).toBe('p@c.com')
    })

    test('credenciales invalidas devuelve 401', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })

        const res = await request.post('/api/login').send({ email: 'p@c.com', password: 'mala' })

        expect(res.status).toBe(401)
        expect(res.body.error).toContain('Email')
    })

    test('campos vacios devuelve 400', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })

        const res = await request.post('/api/login').send({ email: '', password: '' })

        expect(res.status).toBe(400)
        expect(res.body.error).toContain('Email')
    })

    test('usuario inactivo devuelve 403', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA, activo: false })

        const res = await request.post('/api/login').send({ email: 'p@c.com', password: '1234' })

        expect(res.status).toBe(403)
        expect(res.body.error).toContain('desactivada')
    })
})
