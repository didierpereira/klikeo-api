"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNegocioUseCase = void 0;
const categories_1 = require("../../constants/categories");
const slug_1 = require("../../utils/slug");
class CreateNegocioUseCase {
    negocioRepo;
    constructor(negocioRepo) {
        this.negocioRepo = negocioRepo;
    }
    async execute(input, ownerId) {
        const { name, category, city, whatsappNumber } = input;
        if (!name || name.length < 2) {
            throw new Error("El nombre debe tener al menos 2 caracteres");
        }
        if (!city) {
            throw new Error("La ciudad es requerida");
        }
        if (!whatsappNumber) {
            throw new Error("El número de WhatsApp es requerido");
        }
        if (!categories_1.BUSINESS_CATEGORIES.includes(category)) {
            throw new Error("Categoría inválida");
        }
        const slug = (0, slug_1.normalizeSlug)(input.slug ?? name);
        if (!slug) {
            throw new Error("Slug inválido");
        }
        const data = { ...input, ownerId, slug };
        return this.negocioRepo.create(data);
    }
}
exports.CreateNegocioUseCase = CreateNegocioUseCase;
