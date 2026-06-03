"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListProductsByBusinessUseCase = void 0;
class ListProductsByBusinessUseCase {
    productRepo;
    constructor(productRepo) {
        this.productRepo = productRepo;
    }
    async execute(input) {
        return this.productRepo.listByBusiness(input.negocioId, {
            page: input.page,
            limit: input.limit,
        });
    }
}
exports.ListProductsByBusinessUseCase = ListProductsByBusinessUseCase;
