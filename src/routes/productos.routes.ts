import { Router } from 'express'
import multer from 'multer'
import {
  createProductController,
  deleteProductController,
  getProductController,
  listProductsByBusinessController,
  listPublicProductsByBusinessController,
  updateProductController,
  uploadProductImageController,
} from '../controllers/productos.controller'
import { authenticate } from '../middlewares/authenticate'

const upload = multer({ storage: multer.memoryStorage() })
const router = Router()

router.get('/negocios/:id/productos', authenticate, listProductsByBusinessController)
router.get('/negocios/:id/productos/public', listPublicProductsByBusinessController)
router.post('/negocios/:id/productos', authenticate, createProductController)
router.get('/productos/:id', getProductController)
router.put('/productos/:id', authenticate, updateProductController)
router.delete('/productos/:id', authenticate, deleteProductController)
router.post('/productos/:id/image', authenticate, upload.single('image'), uploadProductImageController)

export default router
