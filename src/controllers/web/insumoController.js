import insumoService from '../../services/insumoService.js'

const listarInsumosWeb = async (req, res) => {
    try {
        const insumos = await insumoService.obtenerInsumos()
        const titulo = 'Listado de insumos'

        res.render('insumos/listado', { insumos, titulo })
    } catch (error) {
		res.status(500).render('error', { mensaje: 'Error al cargar listado de insumos' })
    }
}

const renderFormularioNuevoInsumoWeb = async (req, res) => {
    try {
        const titulo = 'Alta de nuevo insumo'

        res.render('insumos/nuevo', { titulo })
    } catch (error) {
        res.status(500).render('error', { mensaje: 'Error al cargar formulario nuevo insumo' })
    }
}

const crearInsumoWeb = async (req, res) => {
    try {
        const { nombre, unidad, balance } = req.body

        await insumoService.crearInsumo(nombre, unidad, balance)

        res.redirect('/insumos')
    } catch (error) {
        res.status(500).render('error', { mensaje: 'Error al crear insumo' })
    }
}

const renderFormularioEditarInsumoWeb = async (req, res) => {
    try {
        const id = req.params.id
        const insumo = await insumoService.buscarInsumoPorId(id)

        if (!insumo) {
            return res.status(404).render('error', { mensaje: 'Insumo no encontrado' })
        }

        const titulo = `Editar insumo "${insumo.nombre}"`

        res.render('insumos/editar', { insumo, titulo })
    } catch (error) {
        res.status(500).render('error', { mensaje: 'Error al cargar formulario editar insumo' })
    }
}

const actualizarInsumoWeb = async (req, res) => {
    try {
        const id = req.params.id
        const { nombre, unidad, balance } = req.body

        const insumo = await insumoService.actualizarInsumo(id, nombre, unidad, balance)

        if (!insumo) {
            return res.status(404).render('error', { mensaje: 'Insumo no encontrado' })
        }

        res.redirect('/insumos')
    } catch (error) {
        res.status(500).render('error', { mensaje: 'Error al actualizar insumo' })
    }
}

const cambiarEstadoInsumoWeb = async (req, res) => {
    try {
        const id = req.params.id

        const insumo = await insumoService.cambiarEstadoInsumo(id)

        if (!insumo) {
            return res.status(404).render('error', { mensaje: 'Insumo no encontrado' })
        }

        res.redirect('/insumos')
    } catch (error) {
        res.status(500).render('error', { mensaje: 'Error al cambiar estado' })
    }
}

const eliminarInsumoWeb = async (req, res) => {
    try {
        const id = req.params.id

        const insumo = await insumoService.eliminarInsumo(id)

        if (!insumo) {
            return res.status(404).render('error', { mensaje: 'Insumo no encontrado' })
        }

        res.redirect('/insumos')
    } catch (error) {
        res.status(500).render('error', { mensaje: 'Error al eliminar insumo' })
    }
}

export {
    listarInsumosWeb,
    renderFormularioNuevoInsumoWeb,
    crearInsumoWeb,
    renderFormularioEditarInsumoWeb,
    actualizarInsumoWeb,
    cambiarEstadoInsumoWeb,
    eliminarInsumoWeb,
}
