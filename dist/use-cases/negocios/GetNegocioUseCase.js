"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNegocioUseCase = void 0;
class GetNegocioUseCase {
    negocioRepo;
    constructor(negocioRepo) {
        this.negocioRepo = negocioRepo;
    }
    async execute(identifier) {
        const negocio = await this.negocioRepo.findByIdOrSlug(identifier);
        if (!negocio) {
            throw new Error('NEGOCIO_NOT_FOUND');
        }
        return negocio;
    }
}
exports.GetNegocioUseCase = GetNegocioUseCase;
