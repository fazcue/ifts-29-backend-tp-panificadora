import { initTestEnvironment, destroyTestEnvironment, limpiarColecciones, request, crearActor, loginComo } from '../helpers.js'
import { TIPOS_ACTOR } from '../../src/lib/tiposActor.js'
import { ESTADOS_PEDIDO } from '../../src/lib/estadosPedido.js'
import mongoose from 'mongoose'

beforeAll(initTestEnvironment, 30000)
afterAll(destroyTestEnvironment, 30000)
beforeEach(limpiarColecciones)

// ─── Helpers ───────────────────────────────────────────────

const crearProducto = async () => {
    const Producto = (await import('../../src/models/Producto.js')).default
    return Producto.create({ nombre: 'Pan', precio: 100, activo: true })
}

const crearPedidoEntregado = async (actorId, fecha) => {
    const Pedido = (await import('../../src/models/Pedido.js')).default
    return Pedido.create({
        actor: actorId,
        fecha_entrega_esperada: fecha,
        fecha_entrega_real: fecha,
        estado: ESTADOS_PEDIDO.ENTREGADO,
    })
}

// ─── GET /royalties ────────────────────────────────────────

describe('GET /royalties', () => {
    test('lista los royalties registrados', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const Royalty = (await import('../../src/models/Royalty.js')).default
        await Royalty.create({ actor: fran._id, periodo: '2026-06', monto_calculado: 500 })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get('/royalties').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('2026-06')
        expect(res.text).toContain('Fran')
    })

    test('rechaza acceso sin autenticacion', async () => {
        const res = await request.get('/royalties').redirects(0)
        expect(res.headers.location).toBe('/')
    })
})

// ─── GET /royalties/calcular ───────────────────────────────

describe('GET /royalties/calcular', () => {
    test('muestra formulario con franquicias activas', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get('/royalties/calcular').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Fran')
    })
})

// ─── POST /royalties/calcular ──────────────────────────────

describe('POST /royalties/calcular', () => {
    test('calcula royalty y redirige al listado', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()
        const pedido = await crearPedidoEntregado(fran._id, new Date('2026-06-15'))
        const DetallePedido = (await import('../../src/models/DetallePedido.js')).default
        await DetallePedido.create({ pedido: pedido._id, producto: producto._id, cantidad: 10, precio_unitario: 100 })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/royalties/calcular')
            .set('Cookie', cookie)
            .send({ id_actor: String(fran._id), periodo: '2026-06' })
            .redirects(0)

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/royalties')

        const Royalty = (await import('../../src/models/Royalty.js')).default
        const royalty = await Royalty.findOne({ actor: fran._id, periodo: '2026-06' })
        expect(royalty).not.toBeNull()
        // 10 * 100 = 1000 * 5% = 50
        expect(royalty.monto_calculado).toBe(50)
    })

    test('rechaza si falta actor o periodo', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/royalties/calcular')
            .set('Cookie', cookie)
            .send({ id_actor: '', periodo: '' })

        expect(res.status).toBe(400)
    })

    test('rechaza si solo falta actor', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/royalties/calcular')
            .set('Cookie', cookie)
            .send({ id_actor: '', periodo: '2026-06' })

        expect(res.status).toBe(400)
    })
})

// ─── POST /royalties/cambiar-estado/:id ────────────────────

describe('POST /royalties/cambiar-estado/:id', () => {
    test('cambia estado del royalty y redirige al listado', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const Royalty = (await import('../../src/models/Royalty.js')).default
        const royalty = await Royalty.create({ actor: fran._id, periodo: '2026-06', monto_calculado: 500 })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post(`/royalties/cambiar-estado/${royalty._id}`)
            .set('Cookie', cookie)
            .send({ estado: 'COBRADO' })
            .redirects(0)

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/royalties')

        const actualizado = await Royalty.findById(royalty._id)
        expect(actualizado.estado).toBe('COBRADO')
    })

    test('rechaza si falta estado', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const Royalty = (await import('../../src/models/Royalty.js')).default
        const royalty = await Royalty.create({ actor: fran._id, periodo: '2026-06', monto_calculado: 500 })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post(`/royalties/cambiar-estado/${royalty._id}`)
            .set('Cookie', cookie)
            .send({ estado: '' })

        expect(res.status).toBe(400)
    })

    test('rechaza royalty inexistente', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post(`/royalties/cambiar-estado/${new mongoose.Types.ObjectId()}`)
            .set('Cookie', cookie)
            .send({ estado: 'COBRADO' })

        expect(res.status).toBe(404)
    })
})
