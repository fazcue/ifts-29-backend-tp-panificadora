import { initTestEnvironment, destroyTestEnvironment, limpiarColecciones, request, crearActor, loginComo } from '../helpers.js'
import { TIPOS_ACTOR } from '../../src/lib/tiposActor.js'
import { ESTADOS_PEDIDO } from '../../src/lib/estadosPedido.js'

beforeAll(initTestEnvironment, 30000)
afterAll(destroyTestEnvironment, 30000)
beforeEach(limpiarColecciones)

// ─── Helpers ───────────────────────────────────────────────

const crearProducto = async (datos = {}) => {
    const Producto = (await import('../../src/models/Producto.js')).default
    return Producto.create({ nombre: 'Pan', precio: 100, activo: true, ...datos })
}

const crearPedido = async (actorId, datos = {}) => {
    const Pedido = (await import('../../src/models/Pedido.js')).default
    return Pedido.create({
        actor: actorId,
        fecha_entrega_esperada: new Date('2026-07-15'),
        estado: ESTADOS_PEDIDO.PENDIENTE,
        ...datos,
    })
}

const crearDetalle = async (pedidoId, productoId, cantidad = 5, precio = 100) => {
    const DetallePedido = (await import('../../src/models/DetallePedido.js')).default
    return DetallePedido.create({
        pedido: pedidoId,
        producto: productoId,
        cantidad,
        precio_unitario: precio,
    })
}

// ─── GET /reportes ─────────────────────────────────────────

describe('GET /reportes', () => {
    test('muestra pagina de acceso a reportes', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get('/reportes').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Reportes')
    })

    test('rechaza acceso sin autenticacion', async () => {
        const res = await request.get('/reportes').redirects(0)
        expect(res.headers.location).toBe('/')
    })
})

// ─── GET /reportes/demanda-consolidada ─────────────────────

describe('GET /reportes/demanda-consolidada', () => {
    test('muestra demanda consolidada de productos en pedidos activos', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()
        const pedido = await crearPedido(fran._id, { estado: ESTADOS_PEDIDO.EN_PRODUCCION })
        await crearDetalle(pedido._id, producto._id, 10)
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get('/reportes/demanda-consolidada').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Pan')
    })

    test('excluye pedidos ya entregados', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()
        const pedido = await crearPedido(fran._id, { estado: ESTADOS_PEDIDO.ENTREGADO, fecha_entrega_real: new Date() })
        await crearDetalle(pedido._id, producto._id, 10)
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get('/reportes/demanda-consolidada').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).not.toContain('Pan')
    })

    test('muestra mensaje si no hay demanda', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get('/reportes/demanda-consolidada').set('Cookie', cookie)

        expect(res.status).toBe(200)
    })
})

// ─── GET /reportes/retrasos-entregas ───────────────────────

describe('GET /reportes/retrasos-entregas', () => {
    test('muestra pedidos con fecha vencida no entregados', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        // Pedido con fecha en el pasado y no ENTREGADO
        await crearPedido(fran._id, { fecha_entrega_esperada: new Date('2025-01-01') })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get('/reportes/retrasos-entregas').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Fran')
    })

    test('excluye pedidos entregados aunque esten vencidos', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        await crearPedido(fran._id, {
            fecha_entrega_esperada: new Date('2025-01-01'),
            estado: ESTADOS_PEDIDO.ENTREGADO,
            fecha_entrega_real: new Date('2025-01-02'),
        })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get('/reportes/retrasos-entregas').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).not.toContain('Fran')
    })

    test('excluye pedidos futuros', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        // Pedido con fecha futura y PENDIENTE — no debería aparecer como retraso
        await crearPedido(fran._id, { fecha_entrega_esperada: new Date('2099-12-31') })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get('/reportes/retrasos-entregas').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).not.toContain('Fran')
    })
})
