"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductUseCase = void 0;
class CreateProductUseCase {
    productRepo;
    negocioRepo;
    constructor(productRepo, negocioRepo) {
        this.productRepo = productRepo;
        this.negocioRepo = negocioRepo;
    }
    async execute(input, negocioId, ownerId) {
        const { name, category, price, stock } = input;
        if (!name || name.trim().length < 2) {
            throw new Error('El nombre del producto debe tener al menos 2 caracteres');
        }
        if (!category || category.trim().length === 0) {
            throw new Error('La categoría del producto es requerida');
        }
        if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
            throw new Error('El precio debe ser un número mayor o igual a 0');
        }
        if (typeof stock !== 'number' || Number.isNaN(stock) || stock < 0) {
            throw new Error('El stock debe ser un número mayor o igual a 0');
        }
        const negocio = await this.negocioRepo.findById(negocioId);
        if (!negocio) {
            throw new Error('Negocio no encontrado');
        }
        if (negocio.ownerId !== ownerId) {
            throw new Error('FORBIDDEN');
        }
        const data = {
            negocioId,
            name: name.trim(),
            description: input.description?.trim(),
            category: category.trim(),
            price,
            stock,
            imageUrl: input.imageUrl,
            imagePublicId: input.imagePublicId,
            isActive: input.isActive ?? true,
            ingredients: input.ingredients?.map((ingredient) => ({
                name: ingredient.name.trim(),
                extraPrice: ingredient.extraPrice ?? 0,
                isDefault: ingredient.isDefault ?? false,
            })),
            additions: input.additions?.map((addition) => ({
                name: addition.name.trim(),
                price: addition.price,
                description: addition.description?.trim(),
                isDefault: addition.isDefault ?? false,
            })),
        };
        return this.productRepo.create(data);
    }
}
exports.CreateProductUseCase = CreateProductUseCase;
