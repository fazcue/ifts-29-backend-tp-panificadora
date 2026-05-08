import { readFile, writeFile } from 'fs/promises'

const BASE_PATH = 'data'

const readData = async (collection) => {
    const data = await readFile(`${BASE_PATH}/${collection}.json`)

    return JSON.parse(data)
}

const writeData = async (collection, data) => {
    await writeFile(`${BASE_PATH}/${collection}.json`, JSON.stringify(data, null, 4))
}

export { readData, writeData }
