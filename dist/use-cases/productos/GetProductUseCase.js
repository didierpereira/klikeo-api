"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProductUseCase = void 0;
class GetProductUseCase {
    productRepo;
    constructor(productRepo) {
        this.productRepo = productRepo;
    }
    async execute(productId) {
        const product = await this.productRepo.findById(productId);
        if (!product || product.isDeleted) {
            throw new Error('PRODUCT_NOT_FOUND');
        }
        return product;
    }
}
exports.GetProductUseCase = GetProductUseCase;
