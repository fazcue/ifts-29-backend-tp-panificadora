import { Router } from 'express'
import { ingresar } from '../../controllers/web/loginController.js'

const router = Router()

router.get('/', (req, res) => res.render('login'))
router.post('/', ingresar)
router.get('/portada', (req, res) => res.render('portada'))

export default router
