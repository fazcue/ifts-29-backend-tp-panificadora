import { initTestEnvironment, destroyTestEnvironment, limpiarColecciones, request, crearActor, loginComo } from '../helpers.js'
import { TIPOS_ACTOR } from '../../src/lib/tiposActor.js'
import mongoose from 'mongoose'

beforeAll(initTestEnvironment, 30000)
afterAll(destroyTestEnvironment, 30000)
beforeEach(limpiarColecciones)

describe('GET /actores', () => {
    test('lista los actores registrados', async () => {
        await crearActor({ nombre: 'Admin', email: 'admin@c.com', tipo: TIPOS_ACTOR.PLANTA })
        await crearActor({ nombre: 'Fran A', email: 'fa@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const { cookie } = await loginComo('admin@c.com', '1234')

        const res = await request.get('/actores').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Admin')
        expect(res.text).toContain('Fran A')
    })

    test('rechaza acceso sin autenticacion', async () => {
        const res = await request.get('/actores').redirects(0)
        expect(res.headers.location).toBe('/')
    })
})

describe('GET /actores/nuevo', () => {
    test('muestra formulario de creacion', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get('/actores/nuevo').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Alta')
    })
})

describe('POST /actores/nuevo', () => {
    test('crea un actor valido y redirige al listado', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/actores/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Nuevo', email: 'nuevo@c.com', password: '123456', tipo: TIPOS_ACTOR.FRANQUICIA })
            .redirects(0)

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/actores')

        const Actor = (await import('../../src/models/Actor.js')).default
        const actor = await Actor.findOne({ email: 'nuevo@c.com' })
        expect(actor).not.toBeNull()
        expect(actor.nombre).toBe('Nuevo')
    })

    test('rechaza nombre vacio', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/actores/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: '', email: 'nuevo@c.com', password: '123456', tipo: TIPOS_ACTOR.FRANQUICIA })

        expect(res.status).toBe(400)
        expect(res.text).toContain('nombre')
    })

    test('rechaza email invalido', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/actores/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Nuevo', email: 'invalido', password: '123456', tipo: TIPOS_ACTOR.FRANQUICIA })

        expect(res.status).toBe(400)
        expect(res.text).toContain('Email')
    })

    test('rechaza tipo invalido', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/actores/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Nuevo', email: 'nuevo@c.com', password: '123456', tipo: 'INVALIDO' })

        expect(res.status).toBe(400)
        expect(res.text).toContain('Tipo')
    })

    test('rechaza password vacia', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/actores/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Nuevo', email: 'nuevo@c.com', password: '', tipo: TIPOS_ACTOR.FRANQUICIA })

        expect(res.status).toBe(400)
        expect(res.text).toContain('contrase')
    })

    test('rechaza email duplicado', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        await crearActor({ nombre: 'Existente', email: 'dup@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/actores/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'Otro', email: 'dup@c.com', password: '123456', tipo: TIPOS_ACTOR.FRANQUICIA })

        expect(res.status).toBe(409)
        expect(res.text).toContain('Ya existe un actor con el email')
    })

    test('rechaza crear un segundo PLANTA', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post('/actores/nuevo')
            .set('Cookie', cookie)
            .send({ nombre: 'P2', email: 'p2@c.com', password: '123456', tipo: TIPOS_ACTOR.PLANTA })

        expect(res.status).toBe(409)
        expect(res.text).toContain('Ya existe un actor')
    })
})

describe('GET /actores/editar/:id', () => {
    test('muestra formulario con datos del actor', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'fran@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get(`/actores/editar/${fran._id}`).set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('Fran')
    })

    test('devuelve 404 si el actor no existe', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')
        const idFalso = new mongoose.Types.ObjectId()

        const res = await request.get(`/actores/editar/${idFalso}`).set('Cookie', cookie)

        expect(res.status).toBe(404)
    })
})

describe('POST /actores/editar/:id', () => {
    test('actualiza un actor y redirige al listado', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'fran@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post(`/actores/editar/${fran._id}`)
            .set('Cookie', cookie)
            .send({ nombre: 'Fran Actualizado', email: 'fran@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
            .redirects(0)

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/actores')

        const Actor = (await import('../../src/models/Actor.js')).default
        const actualizado = await Actor.findById(fran._id)
        expect(actualizado.nombre).toBe('Fran Actualizado')
    })

    test('no permite cambiar el tipo del actor PLANTA', async () => {
        const planta = await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post(`/actores/editar/${planta._id}`)
            .set('Cookie', cookie)
            .send({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })

        expect(res.status).toBe(409)
        expect(res.text).toContain('No se puede editar')
    })
})

describe('POST /actores/cambiar-estado/:id', () => {
    test('desactiva un actor FRANQUICIA', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const fran = await crearActor({ nombre: 'Fran', email: 'fran@c.com', tipo: TIPOS_ACTOR.FRANQUICIA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post(`/actores/cambiar-estado/${fran._id}`)
            .set('Cookie', cookie)
            .redirects(0)

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/actores')

        const Actor = (await import('../../src/models/Actor.js')).default
        const desactivado = await Actor.findById(fran._id)
        expect(desactivado.activo).toBe(false)
    })

    test('no permite desactivar al actor PLANTA', async () => {
        const planta = await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request
            .post(`/actores/cambiar-estado/${planta._id}`)
            .set('Cookie', cookie)

        expect(res.status).toBe(409)
        expect(res.text).toContain('No se puede desactivar')
    })
})
