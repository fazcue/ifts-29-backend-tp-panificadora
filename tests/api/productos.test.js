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

const crearProducto = async () => {
    const Producto = (await import('../../src/models/Producto.js')).default
    return Producto.create({ nombre: 'Pan', precio: 100, activo: true })
}

const crearInsumo = async () => {
    const Insumo = (await import('../../src/models/Insumo.js')).default
    return Insumo.create({ nombre: 'Harina', unidad: 'kg', balance: 100 })
}

describe('API /api/productos', () => {
    test('GET / lista productos', async () => {
        await crearProducto()
        const res = await request.get('/api/productos').set('Authorization', auth())

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
    })

    test('GET /:id devuelve un producto', async () => {
        const producto = await crearProducto()
        const res = await request.get(`/api/productos/${producto._id}`).set('Authorization', auth())

        expect(res.status).toBe(200)
        expect(res.body.nombre).toBe('Pan')
    })

    test('POST / crea un producto con receta', async () => {
        const insumo = await crearInsumo()
        const res = await request
            .post('/api/productos')
            .set('Authorization', auth())
            .send({
                nombre: 'Pan Frances',
                precio: 80,
                activo: true,
                insumos: [{ id_insumo: String(insumo._id), cantidad_necesaria: '0.3' }],
            })

        expect(res.status).toBe(201)
        expect(res.body.nombre).toBe('Pan Frances')
    })

    test('POST / rechaza precio <= 0 (400)', async () => {
        const res = await request
            .post('/api/productos')
            .set('Authorization', auth())
            .send({ nombre: 'Pan', precio: 0, insumos: [] })

        expect(res.status).toBe(400)
        expect(res.body.error).toContain('mayor a cero')
    })

    test('PUT /:id actualiza un producto', async () => {
        const producto = await crearProducto()
        const insumo = await crearInsumo()
        const res = await request
            .put(`/api/productos/${producto._id}`)
            .set('Authorization', auth())
            .send({
                nombre: 'Pan Integral',
                precio: 120,
                activo: true,
                insumos: [{ id_insumo: String(insumo._id), cantidad_necesaria: '0.5' }],
            })

        expect(res.status).toBe(200)
        expect(res.body.nombre).toBe('Pan Integral')
    })

    test('DELETE /:id elimina un producto', async () => {
        const producto = await crearProducto()
        const res = await request
            .delete(`/api/productos/${producto._id}`)
            .set('Authorization', auth())

        expect(res.status).toBe(200)
    })

    test('DELETE /:id rechaza producto con pedidos (409)', async () => {
        const producto = await crearProducto()
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const Pedido = (await import('../../src/models/Pedido.js')).default
        const DetallePedido = (await import('../../src/models/DetallePedido.js')).default
        const pedido = await Pedido.create({ actor: fran._id, fecha_entrega_esperada: new Date() })
        await DetallePedido.create({ pedido: pedido._id, producto: producto._id, cantidad: 5, precio_unitario: 100 })

        const res = await request
            .delete(`/api/productos/${producto._id}`)
            .set('Authorization', auth())

        expect(res.status).toBe(409)
    })
})
