import { Request, Response } from 'express'
import { NegocioRepository } from '../repositories/NegocioRepository'
import { ProductCategoryRepository } from '../repositories/ProductCategoryRepository'
import { CreateProductCategoryUseCase } from '../use-cases/productos/CreateProductCategoryUseCase'
import { ListProductCategoriesByBusinessUseCase } from '../use-cases/productos/ListProductCategoriesByBusinessUseCase'
import { UpdateProductCategoryUseCase } from '../use-cases/productos/UpdateProductCategoryUseCase'
import { DeleteProductCategoryUseCase } from '../use-cases/productos/DeleteProductCategoryUseCase'

const negocioRepo = new NegocioRepository()
const categoryRepo = new ProductCategoryRepository()
const createCategoryUseCase = new CreateProductCategoryUseCase(categoryRepo, negocioRepo)
const listCategoriesUseCase = new ListProductCategoriesByBusinessUseCase(categoryRepo)
const updateCategoryUseCase = new UpdateProductCategoryUseCase(categoryRepo, negocioRepo)
const deleteCategoryUseCase = new DeleteProductCategoryUseCase(categoryRepo)

export const listProductCategoriesByBusinessController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const negocio = await negocioRepo.findByIdOrSlug(req.params.id)
    if (!negocio) {
      res.status(404).json({ error: 'Negocio no encontrado' })
      return
    }
    if (negocio.ownerId !== req.user!.userId) {
      res.status(403).json({ error: 'No tienes permiso para ver estas categorías' })
      return
    }

    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50
    const result = await listCategoriesUseCase.execute({
      negocioId: negocio.id,
      page,
      limit,
    })
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error interno' })
  }
}

export const createProductCategoryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const negocio = await negocioRepo.findByIdOrSlug(req.params.id)
    if (!negocio) {
      res.status(404).json({ error: 'Negocio no encontrado' })
      return
    }
    if (negocio.ownerId !== req.user!.userId) {
      res.status(403).json({ error: 'No tienes permiso' })
      return
    }

    const category = await createCategoryUseCase.execute(req.body, negocio.id, req.user!.userId)
    res.status(201).json(category)
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'FORBIDDEN') {
        res.status(403).json({ error: 'No tienes permiso' })
        return
      }
      res.status(400).json({ error: err.message })
      return
    }
    res.status(500).json({ error: 'Error interno' })
  }
}

export const updateProductCategoryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const updated = await updateCategoryUseCase.execute(req.params.id, req.body, req.user!.userId)
    res.json(updated)
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'FORBIDDEN') {
        res.status(403).json({ error: 'No tienes permiso' })
        return
      }
      if (err.message === 'CATEGORY_NOT_FOUND') {
        res.status(404).json({ error: 'Categoría no encontrada' })
        return
      }
      res.status(400).json({ error: err.message })
      return
    }
    res.status(500).json({ error: 'Error interno' })
  }
}

export const listPublicProductCategoriesByBusinessController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const negocio = await negocioRepo.findByIdOrSlug(req.params.id)
    if (!negocio) {
      res.status(404).json({ error: 'Negocio no encontrado' })
      return
    }

    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50
    const result = await listCategoriesUseCase.execute({
      negocioId: negocio.id,
      page,
      limit,
      onlyActive: true,
    })
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error interno' })
  }
}

export const deleteProductCategoryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const deleted = await deleteCategoryUseCase.execute(req.params.id)
    if (!deleted) {
      res.status(404).json({ error: 'Categoría no encontrada' })
      return
    }
    res.json({ message: 'Categoría eliminada correctamente' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error interno' })
  }
}
