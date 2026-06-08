# La Espiga de Oro S.R.L.

Aplicación Node.js + Express para gestionar pedidos de una panificadora con planta central, sucursales y franquicias.

Incluye interfaz web, API JSON, autenticación con sesiones y control de acceso por atributos del actor.

## Funcionalidades principales

- Login con email y contraseña.
- Gestión de actores, productos y pedidos.
- Pedidos con detalle de productos y estados.
- Interfaz web con Pug.
- API JSON para los mismos recursos principales.
- Persistencia en MongoDB con Mongoose.

## Estado del proyecto

Completado:

- [x] Arquitectura modular con modelos, rutas, controladores, servicios, middlewares y validadores.
- [x] Persistencia en MongoDB con Mongoose.
- [x] Autenticación web con sesiones.
- [x] CRUD web y API para actores, productos y pedidos.
- [x] Pedidos relacionados con actor y detalle de productos.
- [x] Estados de pedido: pendiente, en producción, despachado y entregado.
- [x] Validaciones de datos obligatorios y referencias entre módulos.
- [x] Control de dependencias antes de eliminar recursos usados por pedidos.
- [x] ABAC para proteger accesos web y API según tipo y estado del actor.
- [x] Portal web básico para que sucursales y franquicias gestionen sus propios pedidos.

Pendiente / futuro:

- [ ] Demanda consolidada para planificar producción.
- [ ] Información para compra de insumos y materia prima.
- [ ] Detección de retrasos en entregas.
- [ ] Reportes para conciliación de facturación interna y externa.
- [ ] Seguimiento del cobro de royalties a franquicias.
- [ ] Indicadores de gestión para apoyar la toma de decisiones.
- [ ] Documentación final de pruebas y funcionamiento.

## Reglas de acceso

El sistema usa ABAC basado en los atributos del actor autenticado.

- `PLANTA` tiene acceso global a actores, productos y pedidos.
- `FRANQUICIA` y `SUCURSAL` solo acceden a sus propios pedidos.
- Actores inactivos pueden ver sus pedidos, pero no crear, editar ni eliminar.
- Solo `PLANTA` puede gestionar actores y productos.
- Debe existir un único actor `PLANTA`.
- El actor `PLANTA` no puede desactivarse ni cambiar su tipo.

## Tecnologías

- Node.js
- Express
- MongoDB + Mongoose
- Pug
- express-session + connect-mongo
- bcryptjs

## Estructura

```txt
src/
  app.js
  config/         # MongoDB y sesiones
  controllers/    # Controladores web y API
  lib/            # Constantes y helpers compartidos
  loaders/        # Carga de recursos para ABAC
  middlewares/    # Auth, ABAC y validaciones
  models/         # Modelos Mongoose
  policies/       # Políticas ABAC
  routes/         # Rutas web y API
  services/       # Acceso a datos y lógica reutilizable
  validators/     # Validaciones de dominio
  views/          # Vistas Pug
```

## Instalación

```bash
npm install
```

Crear un archivo `.env` en la raíz:

```env
MONGO_URI=mongodb://127.0.0.1:27017/panificadora
PUERTO=3000
SESSION_SECRET=clave_secreta
```

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

Web:

- `/` login
- `/portada`
- `/actores`
- `/productos`
- `/pedidos`

API:

- `/api/actores`
- `/api/productos`
- `/api/pedidos`

## Datos de dominio

Tipos de actor:

- `PLANTA`
- `FRANQUICIA`
- `SUCURSAL`

Estados de pedido:

- `PENDIENTE`
- `EN_PRODUCCION`
- `DESPACHADO`
- `ENTREGADO`

## Autor

[Facundo Azcue](https://github.com/fazcue)
