import { initTestEnvironment, destroyTestEnvironment, limpiarColecciones, request, crearActor } from '../helpers.js'
import { TIPOS_ACTOR } from '../../src/lib/tiposActor.js'
import { ESTADOS_PEDIDO } from '../../src/lib/estadosPedido.js'
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

describe('API /api/pedidos', () => {
    test('GET / lista pedidos', async () => {
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const Pedido = (await import('../../src/models/Pedido.js')).default
        await Pedido.create({ actor: fran._id, fecha_entrega_esperada: new Date('2026-07-15') })

        const res = await request.get('/api/pedidos').set('Authorization', auth())

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
    })

    test('GET /:id devuelve un pedido con detalles', async () => {
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()
        const Pedido = (await import('../../src/models/Pedido.js')).default
        const DetallePedido = (await import('../../src/models/DetallePedido.js')).default
        const pedido = await Pedido.create({ actor: fran._id, fecha_entrega_esperada: new Date('2026-07-15') })
        await DetallePedido.create({ pedido: pedido._id, producto: producto._id, cantidad: 5, precio_unitario: 100 })

        const res = await request.get(`/api/pedidos/${pedido._id}`).set('Authorization', auth())

        expect(res.status).toBe(200)
        expect(res.body.productos).toBeDefined()
        expect(res.body.productos).toHaveLength(1)
    })

    test('POST / crea un pedido', async () => {
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()

        const res = await request
            .post('/api/pedidos')
            .set('Authorization', auth())
            .send({
                fecha_entrega_esperada: '2026-07-20',
                id_actor: String(fran._id),
                productos: [{ id_producto: String(producto._id), cantidad: 5, precio_unitario: 100 }],
            })

        expect(res.status).toBe(201)
    })

    test('POST / rechaza producto inactivo', async () => {
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const Producto = (await import('../../src/models/Producto.js')).default
        const producto = await Producto.create({ nombre: 'Pan', precio: 100, activo: false })

        const res = await request
            .post('/api/pedidos')
            .set('Authorization', auth())
            .send({
                fecha_entrega_esperada: '2026-07-20',
                id_actor: String(fran._id),
                productos: [{ id_producto: String(producto._id), cantidad: 5, precio_unitario: 100 }],
            })

        expect(res.status).toBe(400)
        expect(res.body.error).toContain('inactivo')
    })

    test('PUT /:id actualiza estado del pedido', async () => {
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()
        const Pedido = (await import('../../src/models/Pedido.js')).default
        const pedido = await Pedido.create({ actor: fran._id, fecha_entrega_esperada: new Date('2026-07-15') })

        const res = await request
            .put(`/api/pedidos/${pedido._id}`)
            .set('Authorization', auth())
            .send({
                fecha_entrega_esperada: '2026-07-15',
                estado: ESTADOS_PEDIDO.ENTREGADO,
                id_actor: String(fran._id),
                productos: [{ id_producto: String(producto._id), cantidad: 5, precio_unitario: 100 }],
            })

        expect(res.status).toBe(200)
        expect(res.body.estado).toBe(ESTADOS_PEDIDO.ENTREGADO)
    })

    test('DELETE /:id elimina un pedido', async () => {
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const Pedido = (await import('../../src/models/Pedido.js')).default
        const pedido = await Pedido.create({ actor: fran._id, fecha_entrega_esperada: new Date('2026-07-15') })

        const res = await request
            .delete(`/api/pedidos/${pedido._id}`)
            .set('Authorization', auth())

        expect(res.status).toBe(200)
    })
})
