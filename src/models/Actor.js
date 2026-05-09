class Actor {
    constructor(nombre, tipo) {
        this.id = Date.now()
        this.nombre = nombre
        this.tipo = tipo
        this.activo = false
    }
}

export default Actor
