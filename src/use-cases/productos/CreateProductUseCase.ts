import { INegocioRepository } from '../../repositories/interfaces/INegocioRepository'
import { IProductCategoryRepository } from '../../repositories/interfaces/IProductCategoryRepository'
import { ProductDomain } from '../../domain/Product'
import { CreateProductData, IProductRepository } from '../../repositories/interfaces/IProductRepository'

export interface CreateProductInput {
  name: string
  description?: string
  category: string
  price: number
  stock: number
  imageUrl?: string
  imagePublicId?: string
  isActive?: boolean
  ingredients?: Array<{
    name: string
    extraPrice?: number
    isDefault?: boolean
  }>
  additions?: Array<{
    name: string
    price: number
    description?: string
    isDefault?: boolean
  }>
}

export class CreateProductUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly negocioRepo: INegocioRepository,
    private readonly categoryRepo: IProductCategoryRepository,
  ) {}

  async execute(input: CreateProductInput, negocioId: string, ownerId: string): Promise<ProductDomain> {
    const { name, category, price, stock } = input

    if (!name || name.trim().length < 2) {
      throw new Error('El nombre del producto debe tener al menos 2 caracteres')
    }
    if (!category || category.trim().length === 0) {
      throw new Error('La categoría del producto es requerida')
    }
    if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
      throw new Error('El precio debe ser un número mayor o igual a 0')
    }
    if (typeof stock !== 'number' || Number.isNaN(stock) || stock < 0) {
      throw new Error('El stock debe ser un número mayor o igual a 0')
    }

    const negocio = await this.negocioRepo.findById(negocioId)
    if (!negocio) {
      throw new Error('Negocio no encontrado')
    }
    if (negocio.ownerId !== ownerId) {
      throw new Error('FORBIDDEN')
    }

    const productCategory = await this.categoryRepo.findByBusinessAndName(negocioId, category.trim())
    if (!productCategory || !productCategory.isActive) {
      throw new Error('La categoría del producto no existe o no está activa')
    }

    const data: CreateProductData = {
      negocioId,
      name: name.trim(),
      description: input.description?.trim(),
      category: category.trim(),
      price,
      stock,
      imageUrl: input.imageUrl,
      imagePublicId: input.imagePublicId,
      isActive: input.isActive ?? true,
      ingredients: input.ingredients?.map((ingredient) => ({
        name: ingredient.name.trim(),
        extraPrice: ingredient.extraPrice ?? 0,
        isDefault: ingredient.isDefault ?? false,
      })),
      additions: input.additions?.map((addition) => ({
        name: addition.name.trim(),
        price: addition.price,
        description: addition.description?.trim(),
        isDefault: addition.isDefault ?? false,
      })),
    }

    return this.productRepo.create(data)
  }
}
