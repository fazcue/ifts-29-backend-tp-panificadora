import { initTestEnvironment, destroyTestEnvironment, limpiarColecciones, request, crearActor, loginComo } from '../helpers.js'
import { TIPOS_ACTOR } from '../../src/lib/tiposActor.js'
import mongoose from 'mongoose'

beforeAll(initTestEnvironment, 30000)
afterAll(destroyTestEnvironment, 30000)
beforeEach(limpiarColecciones)

describe('GET /productos', () => {
    test('lista los productos registrados', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Producto = (await import('../../src/models/Producto.js')).default
        await Producto.create({ nombre: 'Pan', precio: 100, activo: true })

        const res = await request.get('/productos').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Pan')
    })

    test('rechaza acceso sin autenticacion', async () => {
        const res = await request.get('/productos').redirects(0)
        expect(res.headers.location).toBe('/')
    })
})

describe('GET /productos/nuevo', () => {
    test('muestra formulario de creacion con insumos activos', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Insumo = (await import('../../src/models/Insumo.js')).default
        await Insumo.create({ nombre: 'Harina', unidad: 'kg', balance: 100, activo: true })

        const res = await request.get('/productos/nuevo').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Harina')
    })
})

describe('POST /productos/nuevo', () => {
    test('crea un producto con insumos y redirige al listado', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Insumo = (await import('../../src/models/Insumo.js')).default
        const insumo = await Insumo.create({ nombre: 'Harina', unidad: 'kg', balance: 100 })

        const res = await request
            .post('/productos/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Pan', precio: 100, insumos: [{ id_insumo: String(insumo._id), cantidad_necesaria: '0.5' }] })
            .redirects(0)

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/productos')

        const Producto = (await import('../../src/models/Producto.js')).default
        const producto = await Producto.findOne({ nombre: 'Pan' })
        expect(producto).not.toBeNull()
        expect(producto.precio).toBe(100)
    })

    test('crea un producto con insumos (receta)', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Insumo = (await import('../../src/models/Insumo.js')).default
        const insumo = await Insumo.create({ nombre: 'Harina', unidad: 'kg', balance: 100 })

        const res = await request
            .post('/productos/nuevo')
            .set('Cookie', cookie)
            .send({
                nombre: 'Pan',
                precio: 50,
                insumos: [{ id_insumo: String(insumo._id), cantidad_necesaria: '0.5' }],
            })
            .redirects(0)

        expect(res.status).toBe(302)

        // Verificar que se creó la receta
        const Receta = (await import('../../src/models/Receta.js')).default
        const recetas = await Receta.find().populate('insumo')
        expect(recetas).toHaveLength(1)
        expect(recetas[0].insumo.nombre).toBe('Harina')
        expect(recetas[0].cantidad_necesaria).toBe(0.5)
    })

    test('rechaza nombre vacio', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/productos/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: '', precio: 100, insumos: [] })

        expect(res.status).toBe(400)
        expect(res.text).toContain('nombre')
    })

    test('rechaza precio no numerico', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/productos/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Pan', precio: 'abc', insumos: [] })

        expect(res.status).toBe(400)
        expect(res.text).toContain('precio')
    })

    test('rechaza precio vacio', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/productos/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Pan', precio: '', insumos: [] })

        expect(res.status).toBe(400)
        expect(res.text).toContain('precio')
    })

    test('rechaza precio igual a cero', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/productos/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Pan', precio: 0, insumos: [] })

        expect(res.status).toBe(400)
        expect(res.text).toContain('mayor a cero')
    })

    test('rechaza precio negativo', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/productos/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Pan', precio: -10, insumos: [] })

        expect(res.status).toBe(400)
        expect(res.text).toContain('mayor a cero')
    })

    test('rechaza nombre duplicado', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Producto = (await import('../../src/models/Producto.js')).default
        const Insumo = (await import('../../src/models/Insumo.js')).default
        const insumo = await Insumo.create({ nombre: 'Harina', unidad: 'kg', balance: 100 })
        await Producto.create({ nombre: 'Pan', precio: 100, activo: true })

        const res = await request
            .post('/productos/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Pan', precio: 50, insumos: [{ id_insumo: String(insumo._id), cantidad_necesaria: '0.5' }] })

        expect(res.status).toBe(409)
        expect(res.text).toContain('Ya existe')
    })
})

describe('GET /productos/editar/:id', () => {
    test('muestra formulario con datos del producto', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Producto = (await import('../../src/models/Producto.js')).default
        const producto = await Producto.create({ nombre: 'Pan', precio: 100, activo: true })

        const res = await request.get(`/productos/editar/${producto._id}`).set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Pan')
    })

    test('devuelve 404 si el producto no existe', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const idFalso = new mongoose.Types.ObjectId()

        const res = await request.get(`/productos/editar/${idFalso}`).set('Cookie', cookie)

        expect(res.status).toBe(404)
    })
})

describe('POST /productos/editar/:id', () => {
    test('actualiza un producto y redirige al listado', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Insumo = (await import('../../src/models/Insumo.js')).default
        const Producto = (await import('../../src/models/Producto.js')).default
        const insumo = await Insumo.create({ nombre: 'Harina', unidad: 'kg', balance: 100 })
        const producto = await Producto.create({ nombre: 'Pan', precio: 100, activo: true })

        const res = await request
            .post(`/productos/editar/${producto._id}`)
            .set('Cookie', cookie)
            .send({ nombre: 'Pan Integral', precio: 150, insumos: [{ id_insumo: String(insumo._id), cantidad_necesaria: '0.3' }] })
            .redirects(0)

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/productos')

        const actualizado = await Producto.findById(producto._id)
        expect(actualizado.nombre).toBe('Pan Integral')
        expect(actualizado.precio).toBe(150)
    })
})

describe('POST /productos/cambiar-estado/:id', () => {
    test('desactiva y reactiva un producto', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Producto = (await import('../../src/models/Producto.js')).default
        const producto = await Producto.create({ nombre: 'Pan', precio: 100, activo: true })

        await request.post(`/productos/cambiar-estado/${producto._id}`).set('Cookie', cookie).redirects(0)
        const desactivado = await Producto.findById(producto._id)
        expect(desactivado.activo).toBe(false)

        await request.post(`/productos/cambiar-estado/${producto._id}`).set('Cookie', cookie).redirects(0)
        const reactivado = await Producto.findById(producto._id)
        expect(reactivado.activo).toBe(true)
    })
})

describe('POST /productos/eliminar/:id', () => {
    test('elimina un producto sin pedidos asociados', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Producto = (await import('../../src/models/Producto.js')).default
        const producto = await Producto.create({ nombre: 'Pan', precio: 100, activo: true })

        const res = await request
            .post(`/productos/eliminar/${producto._id}`)
            .set('Cookie', cookie)
            .redirects(0)

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/productos')

        const eliminado = await Producto.findById(producto._id)
        expect(eliminado).toBeNull()
    })

    test('rechaza eliminar producto vinculado a un pedido', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Producto = (await import('../../src/models/Producto.js')).default
        const Actor = (await import('../../src/models/Actor.js')).default
        const Pedido = (await import('../../src/models/Pedido.js')).default
        const DetallePedido = (await import('../../src/models/DetallePedido.js')).default

        const producto = await Producto.create({ nombre: 'Pan', precio: 100, activo: true })
        const franquicia = await Actor.create({
            nombre: 'Fran',
            email: 'fran@c.com',
            password: 'x',
            tipo: TIPOS_ACTOR.FRANQUICIA,
            activo: true,
        })
        const pedido = await Pedido.create({
            actor: franquicia._id,
            fecha_entrega_esperada: new Date(),
        })
        await DetallePedido.create({
            pedido: pedido._id,
            producto: producto._id,
            cantidad: 5,
            precio_unitario: 100,
        })

        const res = await request
            .post(`/productos/eliminar/${producto._id}`)
            .set('Cookie', cookie)

        expect(res.status).toBe(409)
        expect(res.text).toContain('asociado')
    })
})
