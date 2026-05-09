class Actor {
    constructor(nombre, email, tipo) {
        this.id = Date.now()
        this.nombre = nombre
        this.email = email
        this.tipo = tipo
        this.activo = false
    }
}

export default Actor
