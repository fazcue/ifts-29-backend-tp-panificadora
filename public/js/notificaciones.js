// Inicializar Notyf para toasts
const notyf = new Notyf({
    duration: 0,
    position: { x: 'right', y: 'bottom' },
    dismissible: true
})

// Conectar Socket.io con identidad del usuario
const socket = io('/')

// Pedido: nuevo pedido creado
socket.on('pedido:nuevo', (data) => {
    notyf.success({message: data.mensaje})
    recargarListado()
})

// Pedido: actualización general (PLANTA ve cambios de franquicias)
socket.on('pedido:actualizado', (data) => {
    notyf.success({message: data.mensaje})
    recargarListado()
})

// Pedido: eliminado
socket.on('pedido:eliminado', (data) => {
    notyf.error({message: data.mensaje})
    recargarListado()
})

// DOM
const recargarListado = async () => {
	const contenedor = document.getElementById('lista-pedidos')
	if (!contenedor) return

	const respuesta = await fetch('/pedidos/listado')
	const html = await respuesta.text()
	contenedor.innerHTML = html
}
