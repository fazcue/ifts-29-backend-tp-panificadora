# La Espiga de Oro S.R.L.

Aplicación Node.js + Express para gestionar pedidos de una panificadora con planta central, sucursales y franquicias.

Incluye interfaz web, API JSON, autenticación con sesiones, control de acceso por atributos del actor (ABAC), reportes y gestión de insumos.

## Funcionalidades principales

- Login con email y contraseña (sesiones persistentes en MongoDB).
- Registro inicial del actor `PLANTA` mediante clave secreta.
- Gestión de actores, productos, pedidos e insumos.
- Recetas que vinculan productos con insumos (cantidad necesaria por unidad).
- Pedidos con detalle de productos, fechas como tipo `Date` y seguimiento de estados.
- Reportes: demanda consolidada y detección de retrasos en entregas.
- Interfaz web con Pug.
- API JSON con autenticación JWT (Bearer token) para los mismos recursos.
- ABAC (Attribute-Based Access Control) para web y API.
- Validaciones de dominio en middleware/validador separados por módulo.
- Persistencia en MongoDB con Mongoose.

## Estado del proyecto

### Completado

- [x] Arquitectura modular con modelos, rutas, controladores, servicios, middlewares y validadores.
- [x] Persistencia en MongoDB con Mongoose.
- [x] Autenticación web con sesiones almacenadas en MongoDB (`connect-mongo`).
- [x] Autenticación API con JWT (Bearer token).
- [x] Registro inicial de planta con `CLAVE_ALTA_PLANTA`.
- [x] CRUD web y API para actores, productos, pedidos e insumos.
- [x] Pedidos relacionados con actor y detalle de productos (virtual populate).
- [x] Estados de pedido: `PENDIENTE`, `EN_PRODUCCION`, `DESPACHADO`, `ENTREGADO`.
- [x] Fecha de entrega real auto-asignada al marcar como entregado.
- [x] Validaciones de datos obligatorios y referencias entre módulos.
- [x] Control de dependencias antes de eliminar recursos usados por pedidos.
- [x] Recetas que asocian insumos a cada producto con cantidad necesaria.
- [x] Validadores genéricos reutilizables (`common.validator.js`).
- [x] Control de dependencias: no eliminar insumo si está vinculado a una receta.
- [x] ABAC para proteger accesos web y API según tipo y estado del actor (`abac.middleware.js` + `abacPolicies.js`).
- [x] Portal web básico para que sucursales y franquicias gestionen sus propios pedidos.
- [x] Reporte de demanda consolidada para planificar producción.
- [x] Reporte de retrasos en entregas (pedidos vencidos no entregados).
- [x] Unificación de middlewares web/API por módulo (patrón `esWeb`).
- [x] Migración de servicios a dot notation (`actor.service.js`, `pedido.service.js`, etc.).
- [x] Validadores modulares por dominio (`actor.validator.js`, `insumo.validator.js`, etc.).
- [x] Helper `fmtFecha` para formateo de fechas.
- [x] Notificaciones en tiempo real con Socket.io (autenticación por sesión Express).
- [x] Actualización automática del listado de pedidos vía WebSocket (re-renderizado parcial con Pug).
- [x] Toasts de notificación con Notyf al crear, actualizar o eliminar pedidos.
- [x] Cliente Socket.io sin dependencia de query params (sesión compartida).
- [x] Módulo de royalties: cálculo automático (5% sobre ventas de pedidos entregados), listado con filtros, y gestión de estados de cobro.

- [x] Suite completa de tests (134 tests, 14 suites) cubriendo web y API.
- [x] Tests aislados con `mongodb-memory-server`.
- [x] Pruebas de autenticación, autorización ABAC y validaciones.

### Pendiente / futuro

- [ ] Informes para compra de insumos y materia prima según recetas.
- [ ] Reportes para conciliación de facturación interna y externa.
- [ ] Indicadores de gestión para apoyar la toma de decisiones.

## Reglas de acceso (ABAC)

El sistema usa ABAC basado en los atributos del actor autenticado, definido en `policies/abacPolicies.js`.

| Recurso     | Acción            | `PLANTA` | `FRANQUICIA` / `SUCURSAL`       |
|-------------|-------------------|----------|----------------------------------|
| Actores     | ver / crear / editar / eliminar | ✅       | ❌                               |
| Productos   | ver / crear / editar / eliminar | ✅       | ❌                               |
| Insumos     | ver / crear / editar / eliminar | ✅       | ❌                               |
| Reportes    | ver               | ✅       | ❌                               |
| Royalties   | ver / calcular / cambiar estado | ✅       | ❌                               |
| Pedidos     | ver               | ✅       | Solo los propios                  |
| Pedidos     | crear              | ✅       | Solo si el actor está activo      |
| Pedidos     | editar / eliminar  | ✅       | Solo si activo, propio y `PENDIENTE` |

- Los actores inactivos pueden ver sus pedidos pero no crear, editar ni eliminar.
- Solo `PLANTA` puede gestionar actores, productos, insumos y ver reportes.
- Debe existir un único actor `PLANTA`.
- El actor `PLANTA` no puede desactivarse ni cambiar su tipo.

## Arquitectura

La aplicación separa la configuración de Express del ciclo de vida del servidor:

- **`app.js`** — Configura y exporta la aplicación Express (middlewares, rutas, motor de vistas, manejo de sesiones). No conecta la base de datos ni inicia el servidor.
- **`server.js`** — Importa `app`, conecta a MongoDB, crea el servidor HTTP con Socket.io, y escucha en el puerto configurado.

Esta separación permite importar `app` en entornos de prueba sin levantar un servidor real ni depender de una base de datos.

## Tecnologías

- **Node.js** — Entorno de ejecución.
- **Express** — Framework web.
- **MongoDB + Mongoose** — Base de datos y ODM.
- **Pug** — Motor de plantillas.
- **express-session + connect-mongo** — Sesiones persistentes (web).
- **jsonwebtoken** — Tokens JWT para autenticación API.
- **socket.io** — Notificaciones en tiempo real y actualización automática del listado de pedidos.
- **bcryptjs** — Hash de contraseñas.
- **dotenv** — Variables de entorno.

## Estructura del proyecto

```txt
src/
  server.js               # Punto de entrada: conecta DB, crea servidor HTTP + Socket.io
  app.js                  # Configuración de Express (middlewares, rutas, sesiones, motor de vistas)
  config/                 # Conexión MongoDB, sesiones y configuración de Socket.io
  controllers/            # Controladores unificados (web/API según contexto)
  lib/                    # Constantes (estadosPedido.js, tiposActor.js, unidades.js) y helpers (utils.js)
  loaders/                # Carga de recursos para ABAC (resourceLoaders.js)
  middlewares/            # Middlewares por módulo (actor, insumo, pedido, producto), auth y ABAC
  models/                 # Modelos Mongoose (Actor, DetallePedido, Insumo, Pedido, Producto, Receta, Royalty)
  policies/               # Políticas ABAC (abacPolicies.js)
  routes/
    api/                  # Rutas de la API REST
    web/                  # Rutas de la interfaz web
  services/               # Lógica de negocio y acceso a datos (actor.service.js, socket.service.js, etc.)
  validators/             # Validaciones de dominio (actor.validator.js, insumo.validator.js, etc.)
  views/                  # Plantillas Pug (actores, insumos, pedidos, productos, reportes, comunes)
public/
  js/                     # Scripts del lado del cliente (notificaciones.js)
```

## Instalación

```bash
npm install
```

Crear un archivo `.env` en la raíz:

```env
MONGO_URI=mongodb://127.0.0.1:27017/panificadora
PUERTO=3000
SESION_SECRETO=clave_secreta
CLAVE_ALTA_PLANTA=clave_unica_para_alta_inicial
JWT_SECRETO=clave_secreta_jwt
JWT_TIEMPO_EXPIRACION=24h
```

- `SESION_SECRETO` — Secreto para firmar las cookies de sesión.
- `CLAVE_ALTA_PLANTA` — Habilita la ruta `/alta-planta` para crear el actor inicial tipo `PLANTA` solo si todavía no existe uno registrado.
- `JWT_SECRETO` — Secreto para firmar los tokens JWT de la API.
- `JWT_TIEMPO_EXPIRACION` — Duración del token (por defecto 24h).

Ejecutar:

```bash
npm start
```

Modo desarrollo:

```bash
npm run dev
```

La app corre por defecto en:

```txt
http://localhost:3000
```

## Rutas principales

### Web (vistas Pug)

| Ruta                    | Descripción                                    |
|-------------------------|------------------------------------------------|
| `/`                     | Login                                          |
| `/alta-planta`          | Registro inicial del actor PLANTA              |
| `/portada`              | Página principal (post-login)                  |
| `/actores`              | CRUD de actores (solo PLANTA)                  |
| `/productos`            | CRUD de productos (solo PLANTA)                |
| `/insumos`              | CRUD de insumos (solo PLANTA)                  |
| `/pedidos`              | CRUD de pedidos                                |
| `/reportes`             | Acceso a reportes (solo PLANTA)                |
| `/reportes/demanda-consolidada` | Demanda consolidada para producción    |
| `/reportes/retrasos-entregas`   | Pedidos con retraso en la entrega       |
| `/royalties`                    | Listado de royalties con filtros        |
| `/royalties/calcular`           | Formulario y cálculo de royalty         |

### API REST

Todas las rutas API (excepto `/api/login`) requieren autenticación mediante **JWT Bearer token**:

| Método | Ruta                   | Descripción                       |
|--------|------------------------|-----------------------------------|
| POST   | `/api/login`           | Iniciar sesión (obtener JWT)      |
| GET    | `/api/actores`         | Listar actores                    |
| GET    | `/api/actores/:id`     | Obtener un actor                  |
| POST   | `/api/actores`         | Crear actor                       |
| PUT    | `/api/actores/:id`     | Actualizar actor                  |
| DELETE | `/api/actores/:id`     | Eliminar actor                    |
| GET    | `/api/productos`       | Listar productos                  |
| GET    | `/api/productos/:id`   | Obtener un producto               |
| POST   | `/api/productos`       | Crear producto                    |
| PUT    | `/api/productos/:id`   | Actualizar producto               |
| DELETE | `/api/productos/:id`   | Eliminar producto                 |
| GET    | `/api/pedidos`         | Listar pedidos                    |
| GET    | `/api/pedidos/:id`     | Obtener un pedido                 |
| POST   | `/api/pedidos`         | Crear pedido                      |
| PUT    | `/api/pedidos/:id`     | Actualizar pedido                 |
| DELETE | `/api/pedidos/:id`     | Eliminar pedido                   |
| GET    | `/api/insumos`         | Listar insumos                    |
| GET    | `/api/insumos/:id`     | Obtener un insumo                 |
| POST   | `/api/insumos`         | Crear insumo                      |
| PUT    | `/api/insumos/:id`     | Actualizar insumo                 |
| DELETE | `/api/insumos/:id`     | Eliminar insumo                   |
| GET    | `/api/royalties`       | Listar royalties (con filtros)    |
| POST   | `/api/royalties/calcular` | Calcular royalty para un actor y período |
| PATCH  | `/api/royalties/:id/estado` | Cambiar estado del royalty    |

## Datos de dominio

### Tipos de actor

- `PLANTA`
- `FRANQUICIA`
- `SUCURSAL`

### Estados de pedido

- `PENDIENTE`
- `EN_PRODUCCION`
- `DESPACHADO`
- `ENTREGADO`

### Unidades de insumo

- `kg` — kilogramo
- `g` — gramo
- `l` — litro
- `ml` — mililitro
- `unidades` — unidades

### Estados de cobro (royalties)

- `PENDIENTE`
- `FACTURADO`
- `COBRADO`

## Tests

### Ejecución

```bash
npm test
```

Muestra resultados por suite y por cada test individual.

### Características

- Cada suite crea su propia base de datos en memoria (`mongodb-memory-server`), sin depender de MongoDB externo.
- Usa `supertest` para probar la aplicación Express sin levantar un servidor real.
- Los tests web extraen la cookie de sesión para simular usuarios autenticados.
- Los tests API obtienen un token JWT mediante `POST /api/login`.
- Comparten helpers desde `tests/helpers.js` (`crearActor`, `loginComo`, `limpiarColecciones`).
- Cubren happy paths, errores de validación, duplicados, dependencias, autorización ABAC y edge cases.

## Autor

[Facundo Azcue](https://github.com/fazcue)
