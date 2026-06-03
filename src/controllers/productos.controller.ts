import { Readable } from 'stream'
import { Request, Response } from 'express'
import cloudinary from '../lib/cloudinary'
import { NegocioRepository } from '../repositories/NegocioRepository'
import { ProductRepository } from '../repositories/ProductRepository'
import { CreateProductUseCase } from '../use-cases/productos/CreateProductUseCase'
import { UpdateProductUseCase } from '../use-cases/productos/UpdateProductUseCase'
import { DeleteProductUseCase } from '../use-cases/productos/DeleteProductUseCase'
import { GetProductUseCase } from '../use-cases/productos/GetProductUseCase'
import { ListProductsByBusinessUseCase } from '../use-cases/productos/ListProductsByBusinessUseCase'

const negocioRepo = new NegocioRepository()
const productRepo = new ProductRepository()
const createProductUseCase = new CreateProductUseCase(productRepo, negocioRepo)
const updateProductUseCase = new UpdateProductUseCase(productRepo, negocioRepo)
const deleteProductUseCase = new DeleteProductUseCase(productRepo)
const getProductUseCase = new GetProductUseCase(productRepo)
const listProductsByBusinessUseCase = new ListProductsByBusinessUseCase(productRepo)

const uploadToCloudinary = async (file: Express.Multer.File): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'klikeo/productos',
      },
      (error, result) => {
        if (error) return reject(error)
        if (!result?.secure_url || !result.public_id) {
          return reject(new Error('Cloudinary upload no devolvió URL segura'))
        }
        resolve({ url: result.secure_url, publicId: result.public_id })
      },
    )

    Readable.from(file.buffer).pipe(uploadStream)
  })
}

const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error)
        if (result?.result === 'ok' || result?.result === 'not_found') {
          return resolve()
        }
        return reject(new Error(`Cloudinary destroy retornó ${result?.result}`))
      },
    )
  })
}

export const listProductsByBusinessController = async (
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
      res.status(403).json({ error: 'No tienes permiso para ver estos productos' })
      return
    }

    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50
    const result = await listProductsByBusinessUseCase.execute({
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

export const getProductController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await getProductUseCase.execute(req.params.id)
    res.json(product)
  } catch (err) {
    if (err instanceof Error && err.message === 'PRODUCT_NOT_FOUND') {
      res.status(404).json({ error: 'Producto no encontrado' })
      return
    }
    res.status(500).json({ error: 'Error interno' })
  }
}

export const createProductController = async (
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

    const product = await createProductUseCase.execute(
      req.body,
      negocio.id,
      req.user!.userId,
    )
    res.status(201).json(product)
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

export const updateProductController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await productRepo.findById(req.params.id)
    if (!product || product.isDeleted) {
      res.status(404).json({ error: 'Producto no encontrado' })
      return
    }

    const negocio = await negocioRepo.findById(product.negocioId)
    if (!negocio) {
      res.status(404).json({ error: 'Negocio no encontrado' })
      return
    }
    if (negocio.ownerId !== req.user!.userId) {
      res.status(403).json({ error: 'No tienes permiso' })
      return
    }

    const updated = await updateProductUseCase.execute(
      req.params.id,
      req.body,
      req.user!.userId,
    )
    res.json(updated)
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'FORBIDDEN') {
        res.status(403).json({ error: 'No tienes permiso' })
        return
      }
      if (err.message === 'PRODUCT_NOT_FOUND') {
        res.status(404).json({ error: 'Producto no encontrado' })
        return
      }
      res.status(400).json({ error: err.message })
      return
    }
    res.status(500).json({ error: 'Error interno' })
  }
}

export const deleteProductController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await productRepo.findById(req.params.id)
    if (!product || product.isDeleted) {
      res.status(404).json({ error: 'Producto no encontrado' })
      return
    }

    const negocio = await negocioRepo.findById(product.negocioId)
    if (!negocio) {
      res.status(404).json({ error: 'Negocio no encontrado' })
      return
    }
    if (negocio.ownerId !== req.user!.userId) {
      res.status(403).json({ error: 'No tienes permiso' })
      return
    }

    if (product.imagePublicId) {
      await deleteFromCloudinary(product.imagePublicId)
    }

    const deleted = await deleteProductUseCase.execute(req.params.id)
    if (!deleted) {
      res.status(404).json({ error: 'Producto no encontrado' })
      return
    }

    res.json({ message: 'Producto eliminado correctamente' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error interno' })
  }
}

export const uploadProductImageController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await productRepo.findById(req.params.id)
    if (!product || product.isDeleted) {
      res.status(404).json({ error: 'Producto no encontrado' })
      return
    }

    const negocio = await negocioRepo.findById(product.negocioId)
    if (!negocio) {
      res.status(404).json({ error: 'Negocio no encontrado' })
      return
    }
    if (negocio.ownerId !== req.user!.userId) {
      res.status(403).json({ error: 'No tienes permiso' })
      return
    }

    const file = (req as any).file as Express.Multer.File | undefined
    if (!file) {
      res.status(400).json({ error: 'Debes subir una imagen' })
      return
    }

    if (product.imagePublicId) {
      await deleteFromCloudinary(product.imagePublicId)
    }

    const uploadResult = await uploadToCloudinary(file)
    const updated = await productRepo.update(product.id, {
      imageUrl: uploadResult.url,
      imagePublicId: uploadResult.publicId,
    })

    if (!updated) {
      res.status(404).json({ error: 'Producto no encontrado' })
      return
    }

    res.json(updated)
  } catch (err) {
    console.error(err)
    const message = err instanceof Error ? err.message : 'Error interno'
    res.status(500).json({ error: message })
  }
}
