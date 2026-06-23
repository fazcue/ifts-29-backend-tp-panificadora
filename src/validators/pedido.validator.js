import { fechaValida } from '../lib/utils.js'
import actorService from '../services/actor.service.js'
import pedidoService from '../services/pedido.service.js'
import productoService from '../services/producto.service.js'
import { errorValidacion, exitoValidacion } from './response.validator.js'
import { obtenerEstadosPedido } from '../lib/estadosPedido.js'
import { validarTextoObligatorio } from './common.validator.js'

const validarFechaEntregaEsperada = (fecha) => {
    const resultado = validarTextoObligatorio(fecha, 'fecha de entrega esperada')

    if (!resultado.ok) {
        return resultado
    }

    const fechaLimpia = resultado.valor

    if (!fechaValida(fechaLimpia)) {
        return errorValidacion('Fecha de entrega esperada inválida')
    }

    return exitoValidacion(fechaLimpia)
}

const validarActor = async (id, validarActivo = true) => {
    // dato faltante
    if (id === undefined || id === null || id === '') {
        return errorValidacion('El actor es obligatorio')
    }

    const actor = await actorService.buscarActorPorId(id)

    // inexistente
    if (!actor) {
        return errorValidacion('Actor inexistente')
    }

    // inactivo
    if (validarActivo && !actor.activo) {
        return errorValidacion('El actor debe estar activo para realizar pedidos')
    }

    return exitoValidacion(actor)
}

const validarFechaEntregaReal = (fecha) => {
    // dato faltante (exitoValidacionso al crear pedido)
    if (fecha === undefined || fecha === null || fecha === '') {
        return exitoValidacion()
    }

    // tipo inv{alido}
    if (typeof fecha !== 'string') {
        return errorValidacion('La fecha de entrega real debe ser texto')
    }

    // normalizar
    const fechaLimpia = fecha.trim()

    // dato faltante (exitoValidacionso al crear pedido)
    if (!fechaLimpia) {
        return exitoValidacion(null)
    }

    // formato inválido
    if (!fechaValida(fechaLimpia)) {
        return errorValidacion('Fecha de entrega real inválida')
    }

    return exitoValidacion(fechaLimpia)
}

const validarPedido = async (id, incluirDetalles = false) => {
    const pedido = incluirDetalles
        ? await pedidoService.buscarPedidoPorIdConDetalles(id)
        : await pedidoService.buscarPedidoPorId(id)

    // inexistente
    if (!pedido) {
        return errorValidacion('Pedido no encontrado', 404)
    }

    return exitoValidacion(pedido)
}

const validarEstado = async (estado) => {
    const resultado = validarTextoObligatorio(estado, 'estado')

    if (!resultado.ok) {
        return resultado
    }

    const estadoLimpio = resultado.valor
    const estados = obtenerEstadosPedido()

    if (!estados.includes(estadoLimpio)) {
        return errorValidacion(`Estado inválido. Opciones: ${estados.join(', ')}`)
    }

    return exitoValidacion(estadoLimpio)
}

const obtenerPrecioUnitario = (productosExistentes = [], idProducto, precioProducto) => {
    const productoExistente = productosExistentes.find((item) => String(item.id_producto) === String(idProducto))

    return productoExistente?.precio_unitario ?? precioProducto
}

const validarProductos = async (productos, productosExistentes = []) => {
	// Si no se enviaron productos, es válido (no se modifican)
	if (productos === undefined) {
		return exitoValidacion(null)
	}

	// tipo inválido
	if (!Array.isArray(productos)) {
		return errorValidacion('Se debe añadir al menos un producto')
	}

	// normalizar: solo se procesan productos con cantidad indicada
	const productosSeleccionados = productos.filter((producto) => {
		const cantidad = producto?.cantidad
		const cantidadTexto = String(cantidad ?? '').trim()

		return cantidadTexto !== '' && Number(cantidadTexto) !== 0
	})

	// Al menos un producto seleccionado
	if (productosSeleccionados.length === 0) {
		return errorValidacion('Se debe añadir al menos un producto')
	}

	// validación individual de productos
	const idsProductos = new Set()
	const productosNormalizados = []

	for (const item of productosSeleccionados) {
		const idProducto = item?.id_producto
		const cantidad = Number(item?.cantidad)

		// producto obligatorio
		if (!idProducto) {
			return errorValidacion('El id del producto es obligatorio')
		}

		// producto duplicado
		if (idsProductos.has(idProducto)) {
			return errorValidacion(
				'No se puede repetir el mismo producto en un pedido',
			)
		}

		idsProductos.add(idProducto)

		// cantidad inválida
		if (Number.isNaN(cantidad)) {
			return errorValidacion('La cantidad debe ser numérica')
		}

		if (!Number.isInteger(cantidad)) {
			return errorValidacion('La cantidad debe ser un numero entero')
		}

		if (cantidad <= 0) {
			return errorValidacion('La cantidad debe ser mayor a cero')
		}

		const producto = await productoService.buscarProductoPorId(idProducto)

		// producto inexistente
		if (!producto) {
			return errorValidacion(`Producto con id ${idProducto} inexistente`)
		}

		const productoExistente = productosExistentes.some(
			(item) => String(item.id_producto) === String(producto.id),
		)

		// producto inactivo
		if (!producto.activo && !productoExistente) {
			return errorValidacion(`Producto "${producto.nombre}" inactivo`)
		}

		productosNormalizados.push({
			id_producto: producto.id,
			cantidad,
			precio_unitario: obtenerPrecioUnitario(
				productosExistentes,
				producto.id,
				producto.precio,
			),
		})
	}

	return exitoValidacion(productosNormalizados)
}

export default {
    validarFechaEntregaEsperada,
    validarActor,
    validarFechaEntregaReal,
    validarPedido,
    validarEstado,
    validarProductos
}
