import { INegocioRepository } from '../../repositories/interfaces/INegocioRepository'
import { IProductCategoryRepository, UpdateProductCategoryData } from '../../repositories/interfaces/IProductCategoryRepository'
import { ProductCategoryDomain } from '../../domain/ProductCategory'

export interface UpdateProductCategoryInput {
  name?: string
  isActive?: boolean
}

export class UpdateProductCategoryUseCase {
  constructor(
    private readonly categoryRepo: IProductCategoryRepository,
    private readonly negocioRepo: INegocioRepository,
  ) {}

  async execute(categoryId: string, input: UpdateProductCategoryInput, ownerId: string): Promise<ProductCategoryDomain> {
    const category = await this.categoryRepo.findById(categoryId)
    if (!category || category.isDeleted) {
      throw new Error('CATEGORY_NOT_FOUND')
    }

    const negocio = await this.negocioRepo.findById(category.negocioId)
    if (!negocio) {
      throw new Error('Negocio no encontrado')
    }
    if (negocio.ownerId !== ownerId) {
      throw new Error('FORBIDDEN')
    }

    const updateData: UpdateProductCategoryData = {}
    if (input.name !== undefined) {
      if (!input.name.trim() || input.name.trim().length < 2) {
        throw new Error('El nombre de la categoría debe tener al menos 2 caracteres')
      }
      updateData.name = input.name.trim()
    }
    if (input.isActive !== undefined) {
      updateData.isActive = input.isActive
    }

    const updated = await this.categoryRepo.update(categoryId, updateData)
    if (!updated) {
      throw new Error('CATEGORY_NOT_FOUND')
    }

    return updated
  }
}
