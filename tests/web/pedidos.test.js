import { initTestEnvironment, destroyTestEnvironment, limpiarColecciones, request, crearActor, loginComo } from '../helpers.js'
import { TIPOS_ACTOR } from '../../src/lib/tiposActor.js'
import { ESTADOS_PEDIDO } from '../../src/lib/estadosPedido.js'
import mongoose from 'mongoose'

beforeAll(initTestEnvironment, 30000)
afterAll(destroyTestEnvironment, 30000)
beforeEach(limpiarColecciones)

// ─── Helpers ───────────────────────────────────────────────

const crearProducto = async (datos = {}) => {
    const Producto = (await import('../../src/models/Producto.js')).default
    return Producto.create({ nombre: 'Pan', precio: 100, activo: true, ...datos })
}

const crearPedidoEnBD = async (datos) => {
    const Pedido = (await import('../../src/models/Pedido.js')).default
    return Pedido.create({
        fecha_entrega_esperada: new Date('2026-07-15'),
        estado: ESTADOS_PEDIDO.PENDIENTE,
        ...datos,
    })
}

// ─── GET /pedidos ──────────────────────────────────────────

describe('GET /pedidos', () => {
    test('PLANTA ve todos los pedidos', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        await crearPedidoEnBD({ actor: fran._id })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get('/pedidos').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Fran')
    })

    test('FRANQUICIA solo ve sus pedidos', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran1 = await crearActor({ nombre: 'Fran A', email: 'fa@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const fran2 = await crearActor({ nombre: 'Fran B', email: 'fb@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        await crearPedidoEnBD({ actor: fran1._id })
        await crearPedidoEnBD({ actor: fran2._id })
        const { cookie } = await loginComo('fa@c.com', '1234')

        const res = await request.get('/pedidos').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Fran A')
        expect(res.text).not.toContain('Fran B')
    })

    test('rechaza acceso sin autenticacion', async () => {
        const res = await request.get('/pedidos').redirects(0)
        expect(res.headers.location).toBe('/')
    })
})

// ─── GET /pedidos/nuevo ────────────────────────────────────

describe('GET /pedidos/nuevo', () => {
    test('muestra formulario con actores activos y productos', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        await crearProducto()
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get('/pedidos/nuevo').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Fran')
        expect(res.text).toContain('Pan')
    })
})

// ─── POST /pedidos/nuevo ───────────────────────────────────

describe('POST /pedidos/nuevo', () => {
    test('crea un pedido valido y redirige al listado', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/pedidos/nuevo')
            .set('Cookie', cookie)
            .send({
                fecha_entrega_esperada: '2026-07-20',
                id_actor: String(fran._id),
                productos: [{ id_producto: String(producto._id), cantidad: '5', precio_unitario: '100' }],
            })
            .redirects(0)

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/pedidos')

        const Pedido = (await import('../../src/models/Pedido.js')).default
        const pedido = await Pedido.findOne().sort({ createdAt: -1 })
        expect(pedido).not.toBeNull()
        expect(String(pedido.actor)).toBe(String(fran._id))
    })

    test('rechaza pedido sin productos', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/pedidos/nuevo')
            .set('Cookie', cookie)
            .send({ fecha_entrega_esperada: '2026-07-20', id_actor: String(fran._id), productos: [] })

        expect(res.status).toBe(400)
        expect(res.text).toContain('producto')
    })

    test('rechaza fecha invalida', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/pedidos/nuevo')
            .set('Cookie', cookie)
            .send({ fecha_entrega_esperada: '', id_actor: String(fran._id), productos: [{ id_producto: String(producto._id), cantidad: '5', precio_unitario: '100' }] })

        expect(res.status).toBe(400)
        expect(res.text).toContain('fecha')
    })

    test('rechaza fecha con formato invalido', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/pedidos/nuevo')
            .set('Cookie', cookie)
            .send({ fecha_entrega_esperada: 'no-es-una-fecha', id_actor: String(fran._id), productos: [{ id_producto: String(producto._id), cantidad: '5', precio_unitario: '100' }] })

        expect(res.status).toBe(400)
        expect(res.text).toContain('inválida')
    })

    test('rechaza actor inexistente', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const producto = await crearProducto()
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/pedidos/nuevo')
            .set('Cookie', cookie)
            .send({ fecha_entrega_esperada: '2026-07-20', id_actor: String(new mongoose.Types.ObjectId()), productos: [{ id_producto: String(producto._id), cantidad: '5', precio_unitario: '100' }] })

        expect(res.status).toBe(400)
        expect(res.text).toContain('Actor')
    })

    test('rechaza actor inactivo', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA, activo: false })
        const producto = await crearProducto()
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/pedidos/nuevo')
            .set('Cookie', cookie)
            .send({ fecha_entrega_esperada: '2026-07-20', id_actor: String(fran._id), productos: [{ id_producto: String(producto._id), cantidad: '5', precio_unitario: '100' }] })

        expect(res.status).toBe(400)
        expect(res.text).toContain('activo')
    })

    test('rechaza cantidad igual a cero', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/pedidos/nuevo')
            .set('Cookie', cookie)
            .send({ fecha_entrega_esperada: '2026-07-20', id_actor: String(fran._id), productos: [{ id_producto: String(producto._id), cantidad: '0', precio_unitario: '100' }] })

        expect(res.status).toBe(400)
        expect(res.text).toContain('cantidad')
    })

    test('rechaza cantidad negativa', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/pedidos/nuevo')
            .set('Cookie', cookie)
            .send({ fecha_entrega_esperada: '2026-07-20', id_actor: String(fran._id), productos: [{ id_producto: String(producto._id), cantidad: '-3', precio_unitario: '100' }] })

        expect(res.status).toBe(400)
        expect(res.text).toContain('cantidad')
    })

    test('rechaza producto duplicado en el pedido', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/pedidos/nuevo')
            .set('Cookie', cookie)
            .send({
                fecha_entrega_esperada: '2026-07-20',
                id_actor: String(fran._id),
                productos: [
                    { id_producto: String(producto._id), cantidad: '5', precio_unitario: '100' },
                    { id_producto: String(producto._id), cantidad: '3', precio_unitario: '100' },
                ],
            })

        expect(res.status).toBe(400)
        expect(res.text).toContain('repetir')
    })

    test('rechaza producto inexistente', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/pedidos/nuevo')
            .set('Cookie', cookie)
            .send({ fecha_entrega_esperada: '2026-07-20', id_actor: String(fran._id), productos: [{ id_producto: String(new mongoose.Types.ObjectId()), cantidad: '5', precio_unitario: '100' }] })

        expect(res.status).toBe(400)
        expect(res.text).toContain('inexistente')
    })

    test('rechaza producto inactivo', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto({ activo: false })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/pedidos/nuevo')
            .set('Cookie', cookie)
            .send({ fecha_entrega_esperada: '2026-07-20', id_actor: String(fran._id), productos: [{ id_producto: String(producto._id), cantidad: '5', precio_unitario: '100' }] })

        expect(res.status).toBe(400)
        expect(res.text).toContain('inactivo')
    })
})

// ─── GET /pedidos/editar/:id ───────────────────────────────

describe('GET /pedidos/editar/:id', () => {
    test('muestra formulario con datos del pedido', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        await crearProducto()
        const pedido = await crearPedidoEnBD({ actor: fran._id })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get(`/pedidos/editar/${pedido._id}`).set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Fran')
    })

    test('devuelve 404 si el pedido no existe', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get(`/pedidos/editar/${new mongoose.Types.ObjectId()}`).set('Cookie', cookie)

        expect(res.status).toBe(404)
    })
})

// ─── POST /pedidos/editar/:id ──────────────────────────────

describe('POST /pedidos/editar/:id', () => {
    test('rechaza estado invalido', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()
        const pedido = await crearPedidoEnBD({ actor: fran._id })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post(`/pedidos/editar/${pedido._id}`)
            .set('Cookie', cookie)
            .send({
                fecha_entrega_esperada: '2026-07-15',
                estado: 'INEXISTENTE',
                id_actor: String(fran._id),
                productos: [{ id_producto: String(producto._id), cantidad: '5', precio_unitario: '100' }],
            })

        expect(res.status).toBe(400)
        expect(res.text).toContain('Estado')
    })

    test('rechaza estado vacio', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()
        const pedido = await crearPedidoEnBD({ actor: fran._id })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post(`/pedidos/editar/${pedido._id}`)
            .set('Cookie', cookie)
            .send({
                fecha_entrega_esperada: '2026-07-15',
                estado: '',
                id_actor: String(fran._id),
                productos: [{ id_producto: String(producto._id), cantidad: '5', precio_unitario: '100' }],
            })

        expect(res.status).toBe(400)
        expect(res.text).toContain('estado')
    })

    test('actualiza estado a ENTREGADO y asigna fecha real', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()
        const pedido = await crearPedidoEnBD({ actor: fran._id })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post(`/pedidos/editar/${pedido._id}`)
            .set('Cookie', cookie)
            .send({
                fecha_entrega_esperada: '2026-07-15',
                estado: ESTADOS_PEDIDO.ENTREGADO,
                id_actor: String(fran._id),
                productos: [{ id_producto: String(producto._id), cantidad: '5', precio_unitario: '100' }],
            })
            .redirects(0)

        expect(res.status).toBe(302)

        const Pedido = (await import('../../src/models/Pedido.js')).default
        const actualizado = await Pedido.findById(pedido._id)
        expect(actualizado.estado).toBe(ESTADOS_PEDIDO.ENTREGADO)
        expect(actualizado.fecha_entrega_real).not.toBeNull()
    })
})

// ─── POST /pedidos/eliminar/:id ────────────────────────────

describe('POST /pedidos/eliminar/:id', () => {
    test('elimina un pedido y sus detalles', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()
        const pedido = await crearPedidoEnBD({ actor: fran._id })
        // Crear detalle
        const DetallePedido = (await import('../../src/models/DetallePedido.js')).default
        await DetallePedido.create({ pedido: pedido._id, producto: producto._id, cantidad: 5, precio_unitario: 100 })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post(`/pedidos/eliminar/${pedido._id}`)
            .set('Cookie', cookie)
            .redirects(0)

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/pedidos')

        const Pedido = (await import('../../src/models/Pedido.js')).default
        expect(await Pedido.findById(pedido._id)).toBeNull()

        const detallesRestantes = await DetallePedido.find({ pedido: pedido._id })
        expect(detallesRestantes).toHaveLength(0)
    })
})
