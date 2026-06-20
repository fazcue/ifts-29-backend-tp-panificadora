import insumoService from '../../services/insumo.service.js'

const listarInsumos = async (req, res) => {
    try {
        const insumos = await insumoService.obtenerInsumos()

        res.status(200).json(insumos)
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al listar insumos' })
    }
}

const listarInsumo = async (req, res) => {
    try {
        const id = req.params.id
        const insumo = await insumoService.buscarInsumoPorId(id)

        if (!insumo) {
            return res.status(404).json({ error: 'Insumo no encontrado' })
        }

        res.status(200).json(insumo)
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al listar insumo' })
    }
}

const crearInsumo = async (req, res) => {
    try {
        const { nombre, unidad, balance } = req.body

        const nuevo = await insumoService.crearInsumo(nombre, unidad, balance)

        res.status(201).json(nuevo)
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear insumo' })
    }
}

const actualizarInsumo = async (req, res) => {
    try {
        const id = req.params.id
        const { nombre, unidad, balance } = req.body

        const insumo = await insumoService.actualizarInsumo(id, nombre, unidad, balance)

        if (!insumo) {
            return res.status(404).json({ error: 'Insumo no encontrado' })
        }

        res.status(200).json(insumo)
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar insumo' })
    }
}

const eliminarInsumo = async (req, res) => {
    try {
        const id = req.params.id

        const insumo = await insumoService.eliminarInsumo(id)

        if (!insumo) {
            return res.status(404).json({ error: 'Insumo no encontrado' })
        }

        res.status(200).json(insumo)
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar insumo' })
    }
}

export { listarInsumos, listarInsumo, crearInsumo, actualizarInsumo, eliminarInsumo }
