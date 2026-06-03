import { IProductRepository } from '../../repositories/interfaces/IProductRepository'

export class DeleteProductUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(productId: string): Promise<boolean> {
    return this.productRepo.softDelete(productId)
  }
}
