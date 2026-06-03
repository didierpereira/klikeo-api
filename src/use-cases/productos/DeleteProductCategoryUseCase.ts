import { IProductCategoryRepository } from '../../repositories/interfaces/IProductCategoryRepository'

export class DeleteProductCategoryUseCase {
  constructor(private readonly categoryRepo: IProductCategoryRepository) {}

  async execute(categoryId: string): Promise<boolean> {
    return this.categoryRepo.softDelete(categoryId)
  }
}
