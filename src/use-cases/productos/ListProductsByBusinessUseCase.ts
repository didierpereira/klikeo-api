import { IProductRepository, ListProductsFilter } from '../../repositories/interfaces/IProductRepository'

export interface ListProductsByBusinessInput {
  negocioId: string
  page?: number
  limit?: number
  onlyActive?: boolean
}

export class ListProductsByBusinessUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(input: ListProductsByBusinessInput) {
    return this.productRepo.listByBusiness(input.negocioId, {
      page: input.page,
      limit: input.limit,
      onlyActive: input.onlyActive,
    })
  }
}
