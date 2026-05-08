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
- **Arquitectura:** MVC (Modelo - Vista - Controlador) con separación modular y POO
- **Testing:** Thunder Client


## Arquitectura

El proyecto aplica el patrón **MVC (Modelo - Vista - Controlador)**:
 
| Capa | Carpeta | Responsabilidad |
|---|---|---|
| **Modelo** | `/models` | Clases con POO que representan las entidades del sistema |
| **Vista** | `/views` | Plantillas Pug que renderizan la información |
| **Controlador** | `/controllers` | Recibe las requests y ejecuta la lógica de negocio |
| **Rutas** | `/routes` | Define los endpoints y los conecta con los controladores |
| **Middleware** | `/middleware` | Funciones intermedias: validación de campos, logging |



## Estructura del proyecto

```
ifts-29-backend-tp-panificadora/
├── src/
│   ├── models/
│   ├── services/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── views/
│   └── app.js
├── data/
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
