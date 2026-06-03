"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteProductUseCase = void 0;
class DeleteProductUseCase {
    productRepo;
    constructor(productRepo) {
        this.productRepo = productRepo;
    }
    async execute(productId) {
        return this.productRepo.softDelete(productId);
    }
}
exports.DeleteProductUseCase = DeleteProductUseCase;
