import { IProductRepository } from '../../repositories/interfaces/IProductRepository'
import { ProductDomain } from '../../domain/Product'

export class GetProductUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(productId: string): Promise<ProductDomain> {
    const product = await this.productRepo.findById(productId)
    if (!product || product.isDeleted) {
      throw new Error('PRODUCT_NOT_FOUND')
    }
    return product
  }
}
