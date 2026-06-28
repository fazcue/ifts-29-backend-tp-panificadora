import { initTestEnvironment, destroyTestEnvironment, limpiarColecciones, request, crearActor, loginComo } from '../helpers.js'
import { TIPOS_ACTOR } from '../../src/lib/tiposActor.js'
import mongoose from 'mongoose'

beforeAll(initTestEnvironment, 30000)
afterAll(destroyTestEnvironment, 30000)
beforeEach(limpiarColecciones)

describe('GET /insumos', () => {
    test('lista los insumos registrados', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Insumo = (await import('../../src/models/Insumo.js')).default
        await Insumo.create({ nombre: 'Harina', unidad: 'kg', balance: 100 })
        await Insumo.create({ nombre: 'Azucar', unidad: 'kg', balance: 50 })

        const res = await request.get('/insumos').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Harina')
        expect(res.text).toContain('Azucar')
    })

    test('rechaza acceso sin autenticacion', async () => {
        const res = await request.get('/insumos').redirects(0)
        expect(res.headers.location).toBe('/')
    })
})

describe('GET /insumos/nuevo', () => {
    test('muestra formulario de creacion', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get('/insumos/nuevo').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Alta')
    })
})

describe('POST /insumos/nuevo', () => {
    test('crea un insumo valido y redirige al listado', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/insumos/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Harina', unidad: 'kg', balance: 100 })
            .redirects(0)

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/insumos')

        const Insumo = (await import('../../src/models/Insumo.js')).default
        const insumo = await Insumo.findOne({ nombre: 'Harina' })
        expect(insumo).not.toBeNull()
        expect(insumo.balance).toBe(100)
    })

    test('rechaza nombre vacio', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/insumos/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: '', unidad: 'kg', balance: 10 })

        expect(res.status).toBe(400)
        expect(res.text).toContain('nombre')
    })

    test('rechaza unidad invalida', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/insumos/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Test', unidad: 'litro', balance: 10 })

        expect(res.status).toBe(400)
        expect(res.text).toContain('unidad')
    })

    test('rechaza balance vacio', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/insumos/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Sal', unidad: 'kg', balance: '' })

        expect(res.status).toBe(400)
        expect(res.text).toContain('balance')
    })

    test('rechaza balance no numerico', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/insumos/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Sal', unidad: 'kg', balance: 'abc' })

        expect(res.status).toBe(400)
        expect(res.text).toContain('balance')
    })

    test('rechaza balance no entero', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/insumos/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Sal', unidad: 'kg', balance: 1.5 })

        expect(res.status).toBe(400)
        expect(res.text).toContain('entero')
    })

    test('rechaza balance negativo', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/insumos/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Sal', unidad: 'kg', balance: -10 })

        expect(res.status).toBe(400)
        expect(res.text).toContain('negativo')
    })

    test('rechaza nombre duplicado', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Insumo = (await import('../../src/models/Insumo.js')).default
        await Insumo.create({ nombre: 'harina', unidad: 'kg', balance: 50 })

        const res = await request
            .post('/insumos/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Harina', unidad: 'kg', balance: 10 })

        expect(res.status).toBe(409)
        expect(res.text).toContain('Ya existe')
    })
})

describe('GET /insumos/editar/:id', () => {
    test('muestra formulario con datos del insumo', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Insumo = (await import('../../src/models/Insumo.js')).default
        const insumo = await Insumo.create({ nombre: 'Harina', unidad: 'kg', balance: 100 })

        const res = await request.get(`/insumos/editar/${insumo._id}`).set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Harina')
    })

    test('devuelve 404 si el insumo no existe', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const idFalso = new mongoose.Types.ObjectId()

        const res = await request.get(`/insumos/editar/${idFalso}`).set('Cookie', cookie)

        expect(res.status).toBe(404)
    })
})

describe('POST /insumos/editar/:id', () => {
    test('actualiza un insumo y redirige al listado', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Insumo = (await import('../../src/models/Insumo.js')).default
        const insumo = await Insumo.create({ nombre: 'Harina', unidad: 'kg', balance: 100 })

        const res = await request
            .post(`/insumos/editar/${insumo._id}`)
            .set('Cookie', cookie)
            .send({ nombre: 'Harina Integral', unidad: 'kg', balance: 200 })
            .redirects(0)

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/insumos')

        const actualizado = await Insumo.findById(insumo._id)
        expect(actualizado.nombre).toBe('Harina Integral')
        expect(actualizado.balance).toBe(200)
    })
})

describe('POST /insumos/cambiar-estado/:id', () => {
    test('desactiva y reactiva un insumo', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Insumo = (await import('../../src/models/Insumo.js')).default
        const insumo = await Insumo.create({ nombre: 'Harina', unidad: 'kg', balance: 100, activo: true })

        // Desactivar
        const res1 = await request
            .post(`/insumos/cambiar-estado/${insumo._id}`)
            .set('Cookie', cookie)
            .redirects(0)

        expect(res1.status).toBe(302)
        const desactivado = await Insumo.findById(insumo._id)
        expect(desactivado.activo).toBe(false)

        // Reactivar
        const res2 = await request
            .post(`/insumos/cambiar-estado/${insumo._id}`)
            .set('Cookie', cookie)
            .redirects(0)

        expect(res2.status).toBe(302)
        const reactivado = await Insumo.findById(insumo._id)
        expect(reactivado.activo).toBe(true)
    })
})

describe('POST /insumos/eliminar/:id', () => {
    test('elimina un insumo sin recetas asociadas', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Insumo = (await import('../../src/models/Insumo.js')).default
        const insumo = await Insumo.create({ nombre: 'Harina', unidad: 'kg', balance: 100 })

        const res = await request
            .post(`/insumos/eliminar/${insumo._id}`)
            .set('Cookie', cookie)
            .redirects(0)

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/insumos')

        const eliminado = await Insumo.findById(insumo._id)
        expect(eliminado).toBeNull()
    })

    test('rechaza eliminar insumo vinculado a una receta', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const Insumo = (await import('../../src/models/Insumo.js')).default
        const Producto = (await import('../../src/models/Producto.js')).default

        const insumo = await Insumo.create({ nombre: 'Harina', unidad: 'kg', balance: 100 })
        const producto = await Producto.create({ nombre: 'Pan', precio: 10, activo: true })

        // Crear receta que vincula el insumo al producto
        const Receta = (await import('../../src/models/Receta.js')).default
        await Receta.create({ producto: producto._id, insumo: insumo._id, cantidad_necesaria: 0.5 })

        const res = await request
            .post(`/insumos/eliminar/${insumo._id}`)
            .set('Cookie', cookie)

        expect(res.status).toBe(409)
        expect(res.text).toContain('asociado')
    })
})
