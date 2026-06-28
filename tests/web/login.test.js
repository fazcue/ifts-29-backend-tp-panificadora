import { initTestEnvironment, destroyTestEnvironment, limpiarColecciones, request, crearActor, loginComo } from '../helpers.js'
import { TIPOS_ACTOR } from '../../src/lib/tiposActor.js'

beforeAll(initTestEnvironment, 30000)
afterAll(destroyTestEnvironment, 30000)
beforeEach(limpiarColecciones)

describe('GET /', () => {
    test('sin sesion muestra formulario de login', async () => {
        const res = await request.get('/')

        expect(res.status).toBe(200)
        expect(res.text).toContain('logueate')
    })

    test('con sesion activa redirige a /portada', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get('/').set('Cookie', cookie).redirects(0)

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/portada')
    })
})

describe('POST /', () => {
    test('credenciales validas redirige a /portada y crea sesion', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })

        const { res, cookie } = await loginComo('p@c.com', '1234')

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/portada')
        expect(cookie).toBeDefined()
    })

    test('credenciales invalidas muestra error sin redirigir', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })

        const res = await request.post('/').send({ email: 'p@c.com', password: 'mala' })

        expect(res.status).toBe(200)
        expect(res.text).toContain('Email o contrase')
    })
})

describe('GET /portada', () => {
    test('sin sesion redirige a /', async () => {
        const res = await request.get('/portada').redirects(0)

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/')
    })

    test('con sesion muestra la portada con el nombre del usuario', async () => {
        await crearActor({ nombre: 'PC', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        const res = await request.get('/portada').set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.text).toContain('PC')
    })
})

describe('GET /salir', () => {
    test('destruye la sesion y ya no permite acceder a /portada', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })
        const { cookie } = await loginComo('p@c.com', '1234')

        await request.get('/salir').set('Cookie', cookie)

        const res = await request.get('/portada').set('Cookie', cookie).redirects(0)
        expect(res.headers.location).toBe('/')
    })
})

describe('GET /alta-planta', () => {
    test('sin PLANTA registrado muestra formulario de alta', async () => {
        const res = await request.get('/alta-planta')

        expect(res.status).toBe(200)
        expect(res.text).toContain('Alta inicial')
    })

    test('con PLANTA registrado devuelve 409', async () => {
        await crearActor({ nombre: 'P', email: 'p@c.com', tipo: TIPOS_ACTOR.PLANTA })

        const res = await request.get('/alta-planta')

        expect(res.status).toBe(409)
        expect(res.text).toContain('Ya existe un actor')
    })
})

describe('POST /alta-planta', () => {
    test('clave valida crea PLANTA, inicia sesion y redirige a portada', async () => {
        const res = await request
            .post('/alta-planta')
            .send({ nombre: 'Nueva Planta', email: 'nueva@p.com', password: 'segura', clave_alta_planta: 'clave-test' })
            .redirects(0)

        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/portada')
        expect(res.headers['set-cookie']).toBeDefined()

        const Actor = (await import('../../src/models/Actor.js')).default
        const planta = await Actor.findOne({ email: 'nueva@p.com' })
        expect(planta).not.toBeNull()
        expect(planta.tipo).toBe(TIPOS_ACTOR.PLANTA)
    })

    test('clave invalida devuelve 403', async () => {
        const res = await request
            .post('/alta-planta')
            .send({ nombre: 'Otra', email: 'otra@p.com', password: 'segura', clave_alta_planta: 'clave-mala' })

        expect(res.status).toBe(403)
        expect(res.text).toContain('Clave de alta')
    })
})
