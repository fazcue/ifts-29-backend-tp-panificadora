import { Router } from 'express'
import { ingresarApi } from '../../controllers/login.controller.js'

const router = Router()

router.post('/', ingresarApi)

export default router
