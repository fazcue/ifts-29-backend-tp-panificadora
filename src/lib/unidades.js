const UNIDADES = Object.freeze({
    KG: 'kg',
    G: 'g',
    L: 'l',
    ML: 'ml',
    UNIDADES: 'unidades',
})

const obtenerUnidades = () => {
    return Object.values(UNIDADES)
}

const esUnidadValida = (unidad) => {
    return obtenerUnidades().includes(unidad)
}

export { UNIDADES, obtenerUnidades, esUnidadValida }
