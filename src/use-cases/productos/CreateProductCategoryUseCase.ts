import { INegocioRepository } from '../../repositories/interfaces/INegocioRepository'
import { IProductCategoryRepository, CreateProductCategoryData } from '../../repositories/interfaces/IProductCategoryRepository'
import { ProductCategoryDomain } from '../../domain/ProductCategory'

export interface CreateProductCategoryInput {
  name: string
  isActive?: boolean
}

export class CreateProductCategoryUseCase {
  constructor(
    private readonly categoryRepo: IProductCategoryRepository,
    private readonly negocioRepo: INegocioRepository,
  ) {}

  async execute(input: CreateProductCategoryInput, negocioId: string, ownerId: string): Promise<ProductCategoryDomain> {
    const { name } = input

    if (!name || name.trim().length < 2) {
      throw new Error('El nombre de la categoría debe tener al menos 2 caracteres')
    }

    const negocio = await this.negocioRepo.findById(negocioId)
    if (!negocio) {
      throw new Error('Negocio no encontrado')
    }
    if (negocio.ownerId !== ownerId) {
      throw new Error('FORBIDDEN')
    }

    const existing = await this.categoryRepo.findByBusinessAndName(negocioId, name.trim())
    if (existing) {
      throw new Error('La categoría ya existe para este negocio')
    }

    const data: CreateProductCategoryData = {
      negocioId,
      name: name.trim(),
      isActive: input.isActive ?? true,
    }

    return this.categoryRepo.create(data)
  }
}
