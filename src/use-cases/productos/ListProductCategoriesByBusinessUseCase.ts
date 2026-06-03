import { IProductCategoryRepository, ListProductCategoriesFilter } from '../../repositories/interfaces/IProductCategoryRepository'

export interface ListProductCategoriesByBusinessInput {
  negocioId: string
  page?: number
  limit?: number
  onlyActive?: boolean
}

export class ListProductCategoriesByBusinessUseCase {
  constructor(private readonly categoryRepo: IProductCategoryRepository) {}

  async execute(input: ListProductCategoriesByBusinessInput) {
    return this.categoryRepo.listByBusiness(input.negocioId, {
      page: input.page,
      limit: input.limit,
    })
  }
}
