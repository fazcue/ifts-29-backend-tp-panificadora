import { readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_PATH = join(__dirname, '..', '..', 'data')

const leerData = async (coleccion) => {
    const data = await readFile(join(BASE_PATH, `${coleccion}.json`), 'utf8')
    return JSON.parse(data)
}

const guardarData = async (coleccion, data) => {
    await writeFile(join(BASE_PATH, `${coleccion}.json`), JSON.stringify(data, null, 4))
}

export { leerData, guardarData }
