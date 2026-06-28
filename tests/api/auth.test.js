import { initTestEnvironment, destroyTestEnvironment, limpiarColecciones, request } from '../helpers.js'

beforeAll(initTestEnvironment, 30000)
afterAll(destroyTestEnvironment, 30000)
beforeEach(limpiarColecciones)

describe('API autenticacion', () => {
    test('rechaza peticion sin token', async () => {
        const res = await request.get('/api/actores')

        expect(res.status).toBe(401)
        expect(res.body.error).toContain('Token')
    })

    test('rechaza token invalido', async () => {
        const res = await request.get('/api/actores').set('Authorization', 'Bearer token-invalido')

        expect(res.status).toBe(401)
        expect(res.body.error).toContain('Token')
    })
})
