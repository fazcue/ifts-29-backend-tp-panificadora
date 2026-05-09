import { readFile, writeFile } from 'fs/promises'

const BASE_PATH = 'data'

const leerData = async (coleccion) => {
    const data = await readFile(`${BASE_PATH}/${coleccion}.json`)
    return JSON.parse(data)
}

const guardarData = async (coleccion, data) => {
    await writeFile(`${BASE_PATH}/${coleccion}.json`, JSON.stringify(data, null, 4))
}

export { leerData, guardarData }
