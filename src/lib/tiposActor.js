const TIPOS_ACTOR = Object.freeze({
    PLANTA: 'PLANTA',
    FRANQUICIA: 'FRANQUICIA',
    SUCURSAL: 'SUCURSAL',
})

const esPlanta = (actor) => {
    return actor?.tipo === TIPOS_ACTOR.PLANTA
}

const obtenerTiposActor = () => {
    return Object.values(TIPOS_ACTOR)
}

export { TIPOS_ACTOR, esPlanta, obtenerTiposActor }
