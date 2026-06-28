import { initTestEnvironment, destroyTestEnvironment, limpiarColecciones, request, crearActor } from '../helpers.js'
import { TIPOS_ACTOR } from '../../src/lib/tiposActor.js'

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

const crearInsumo = async () => {
    const Insumo = (await import('../../src/models/Insumo.js')).default
    return Insumo.create({ nombre: 'Harina', unidad: 'kg', balance: 100 })
}

describe('API /api/insumos', () => {
    test('GET / lista insumos', async () => {
        await crearInsumo()
        const res = await request.get('/api/insumos').set('Authorization', auth())

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
    })

    test('GET /:id devuelve un insumo', async () => {
        const insumo = await crearInsumo()
        const res = await request.get(`/api/insumos/${insumo._id}`).set('Authorization', auth())

        expect(res.status).toBe(200)
        expect(res.body.nombre).toBe('Harina')
    })

    test('POST / crea un insumo', async () => {
        const res = await request
            .post('/api/insumos')
            .set('Authorization', auth())
            .send({ nombre: 'Sal', unidad: 'kg', balance: 50 })

        expect(res.status).toBe(201)
        expect(res.body.nombre).toBe('Sal')
    })

    test('POST / rechaza balance negativo (400)', async () => {
        const res = await request
            .post('/api/insumos')
            .set('Authorization', auth())
            .send({ nombre: 'Sal', unidad: 'kg', balance: -5 })

        expect(res.status).toBe(400)
        expect(res.body.error).toContain('negativo')
    })

    test('PUT /:id actualiza un insumo', async () => {
        const insumo = await crearInsumo()
        const res = await request
            .put(`/api/insumos/${insumo._id}`)
            .set('Authorization', auth())
            .send({ nombre: 'Harina Integral', unidad: 'kg', balance: 200 })

        expect(res.status).toBe(200)
        expect(res.body.nombre).toBe('Harina Integral')
    })

    test('DELETE /:id elimina un insumo', async () => {
        const insumo = await crearInsumo()
        const res = await request
            .delete(`/api/insumos/${insumo._id}`)
            .set('Authorization', auth())

        expect(res.status).toBe(200)
    })
})
