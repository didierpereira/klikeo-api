import { Router } from 'express'
import {
  createProductCategoryController,
  deleteProductCategoryController,
  listProductCategoriesByBusinessController,
  listPublicProductCategoriesByBusinessController,
  updateProductCategoryController,
} from '../controllers/producto-categorias.controller'
import { authenticate } from '../middlewares/authenticate'

const router = Router()

router.get('/negocios/:id/categorias', authenticate, listProductCategoriesByBusinessController)
router.get('/negocios/:id/categorias/public', listPublicProductCategoriesByBusinessController)
router.post('/negocios/:id/categorias', authenticate, createProductCategoryController)
router.put('/categorias/:id', authenticate, updateProductCategoryController)
router.delete('/categorias/:id', authenticate, deleteProductCategoryController)

export default router
