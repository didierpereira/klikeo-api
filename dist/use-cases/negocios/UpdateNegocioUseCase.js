"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNegocioUseCase = void 0;
const categories_1 = require("../../constants/categories");
const slug_1 = require("../../utils/slug");
class UpdateNegocioUseCase {
    negocioRepo;
    constructor(negocioRepo) {
        this.negocioRepo = negocioRepo;
    }
    async execute(identifier, data, requestingOwnerId) {
        if (data.slug !== undefined) {
            data.slug = (0, slug_1.normalizeSlug)(data.slug);
            if (!data.slug) {
                throw new Error("Slug inválido");
            }
        }
        const negocio = await this.negocioRepo.findByIdOrSlug(identifier);
        if (!negocio) {
            throw new Error("NEGOCIO_NOT_FOUND");
        }
        if (negocio.ownerId !== requestingOwnerId) {
            throw new Error("FORBIDDEN");
        }
        if (data.category &&
            !categories_1.BUSINESS_CATEGORIES.includes(data.category)) {
            throw new Error("Categoría inválida");
        }
        const updated = await this.negocioRepo.update(negocio.id, data);
        return updated;
    }
}
exports.UpdateNegocioUseCase = UpdateNegocioUseCase;
