import { initTestEnvironment, destroyTestEnvironment, limpiarColecciones, request, crearActor } from '../helpers.js'
import { TIPOS_ACTOR } from '../../src/lib/tiposActor.js'
import { ESTADOS_PEDIDO } from '../../src/lib/estadosPedido.js'

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

describe('API /api/royalties', () => {
    test('GET / lista royalties', async () => {
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const Royalty = (await import('../../src/models/Royalty.js')).default
        await Royalty.create({ actor: fran._id, periodo: '2026-06', monto_calculado: 500 })

        const res = await request.get('/api/royalties').set('Authorization', auth())

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
    })

    test('POST /calcular calcula un royalty', async () => {
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const producto = await crearProducto()
        const Pedido = (await import('../../src/models/Pedido.js')).default
        const DetallePedido = (await import('../../src/models/DetallePedido.js')).default
        const pedido = await Pedido.create({
            actor: fran._id,
            fecha_entrega_esperada: new Date('2026-06-15'),
            fecha_entrega_real: new Date('2026-06-15'),
            estado: ESTADOS_PEDIDO.ENTREGADO,
        })
        await DetallePedido.create({ pedido: pedido._id, producto: producto._id, cantidad: 10, precio_unitario: 100 })

        const res = await request
            .post('/api/royalties/calcular')
            .set('Authorization', auth())
            .send({ id_actor: String(fran._id), periodo: '2026-06' })

        expect(res.status).toBe(200)
        expect(res.body.monto_calculado).toBe(50)
    })

    test('PATCH /:id/estado cambia estado del royalty', async () => {
        const fran = await crearActor({ nombre: 'Fran', email: 'f@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const Royalty = (await import('../../src/models/Royalty.js')).default
        const royalty = await Royalty.create({ actor: fran._id, periodo: '2026-06', monto_calculado: 500 })

        const res = await request
            .patch(`/api/royalties/${royalty._id}/estado`)
            .set('Authorization', auth())
            .send({ estado: 'COBRADO' })

        expect(res.status).toBe(200)
        expect(res.body.estado).toBe('COBRADO')
    })
})
