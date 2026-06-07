const ROLES = Object.freeze({
    PLANTA: 'PLANTA',
    FRANQUICIA: 'FRANQUICIA',
    SUCURSAL: 'SUCURSAL'
})

const esPlanta = (actor) => {
    return actor?.tipo === ROLES.PLANTA
}

export { ROLES, esPlanta }
