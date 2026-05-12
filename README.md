# Panificadora Industrial "La Espiga de Oro S.R.L."

Aplicación web desarrollada con Node.js y Express para la gestión de pedidos, producción, insumos y royalties de la Panificadora Industrial "La Espiga de Oro S.R.L.".

IFTS 29 - Backend


## Descripción del caso

La Espiga de Oro S.R.L. es una fábrica de panificados con **cinco sucursales propias** y una red de **diez franquicias**, donde una planta central concentra toda la producción. Actualmente los pedidos se gestionan de forma informal (mensajería, llamados), lo que genera desconexión entre los actores y dificulta la planificación productiva.

Este sistema busca resolver esa problemática mediante:

- Un **portal de pedidos estructurado** para franquiciados y sucursales.
- **Gestión de estados** del pedido: `pendiente → en produccion → despachado → entregado`.
- **Consolidación de demanda** para planificar la producción y compra de insumos.
- **Detección de retrasos** en la entrega.
- **Seguimiento de royalties** para franquiciados.


## Diagrama de Entidad-Relación (DER)

<!-- Reemplazar con la imagen del DER una vez exportada -->
![DER](./docs/der.png)

| Enum | Valores |
|------|---------|
| `ACTOR.tipo` | `PLANTA`, `SUCURSAL`, `FRANQUICIA` |
| `PEDIDO.estado` | `PENDIENTE`, `EN PRODUCCION`, `DESPACHADO`, `ENTREGADO` |
| `INSUMO.unidad` | `GRAMOS`, `MILILITROS`, `UNIDADES` |
| `ROYALTY.estado_cobro` | `PENDIENTE`, `COBRADO` |

## Tecnologías

- **Runtime:** Node.js
- **Framework:** Express.js
- **Motor de plantillas:** Pug
- **Persistencia:** JSON (archivos `.json` en `/data`)
- **Arquitectura:** MVC (Modelo - Vista - Controlador) con capa de servicios, separación modular y POO
- **Testing:** Thunder Client


## Arquitectura

El proyecto aplica una arquitectura **MVC (Modelo - Vista - Controlador)** con separación modular por responsabilidad. Además de modelos, vistas y controladores, se incorporan capas de **rutas**, **middlewares**, **servicios** y **validators** para mantener la lógica reutilizable y evitar duplicación entre la API JSON y la interfaz web.
 
| Capa | Carpeta | Responsabilidad |
|---|---|---|
| **Modelos** | `/src/models` | Clases que representan entidades del sistema, como `Actor` y `Pedido` |
| **Vistas** | `/src/views` | Plantillas Pug usadas por la interfaz web |
| **Controladores API** | `/src/controllers/api` | Reciben requests HTTP y responden JSON con códigos adecuados |
| **Controladores Web** | `/src/controllers/web` | Reciben requests desde formularios y renderizan vistas o redirecciones |
| **Servicios** | `/src/services` | Centralizan acceso a datos y lógica reutilizable entre API y Web |
| **Rutas API** | `/src/routes/api` | Definen endpoints REST, por ejemplo `/api/actores` y `/api/pedidos` |
| **Rutas Web** | `/src/routes/web` | Definen pantallas y formularios, por ejemplo `/actores` y `/pedidos` |
| **Middlewares API** | `/src/middlewares/api` | Validan datos de entrada y responden errores en formato JSON |
| **Middlewares Web** | `/src/middlewares/web` | Validan formularios y vuelven a renderizar la vista con mensajes de error |
| **Validators** | `/src/validators` | Reglas reutilizables de validación y helpers de respuesta |
| **Lib** | `/src/lib` | Utilidades compartidas, como lectura/escritura JSON y validación de fechas |
| **Persistencia** | `/data` | Archivos JSON usados como almacenamiento temporal |


## Estructura del proyecto

```
ifts-29-backend-tp-panificadora/
├── src/
│   ├── controllers/
│   │   ├── api/
│   │   └── web/
│   ├── lib/
│   ├── middlewares/
│   │   ├── api/
│   │   └── web/
│   ├── models/
│   ├── routes/
│   │   ├── api/
│   │   └── web/
│   ├── services/
│   ├── validators/
│   ├── views/
│   │   ├── actores/
│   │   └── pedidos/
│   └── app.js
├── data/
│   ├── actores.json
│   ├── actor_tipo.json
│   ├── pedidos.json
│   └── pedido_estado.json
├── docs/
│   └── der.png
├── package.json
└── README.md
```


## Instalación y ejecución

### Requisitos previos

- Node.js v18 o superior
- npm

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/fazcue/ifts-29-backend-tp-panificadora.git

# Ingresar al directorio
cd ifts-29-backend-tp-panificadora

# Instalar dependencias
npm install

# Iniciar el servidor
npm start
```

El servidor corre por defecto en `http://localhost:3000`.


## Integrantes
- [Facundo Azcue](https://github.com/fazcue)
