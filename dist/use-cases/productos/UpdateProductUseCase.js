"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductUseCase = void 0;
class UpdateProductUseCase {
    productRepo;
    negocioRepo;
    constructor(productRepo, negocioRepo) {
        this.productRepo = productRepo;
        this.negocioRepo = negocioRepo;
    }
    async execute(productId, input, ownerId) {
        const product = await this.productRepo.findById(productId);
        if (!product || product.isDeleted) {
            throw new Error('PRODUCT_NOT_FOUND');
        }
        const negocio = await this.negocioRepo.findById(product.negocioId);
        if (!negocio) {
            throw new Error('Negocio no encontrado');
        }
        if (negocio.ownerId !== ownerId) {
            throw new Error('FORBIDDEN');
        }
        const updateData = {};
        if (input.name !== undefined) {
            if (!input.name.trim() || input.name.trim().length < 2) {
                throw new Error('El nombre del producto debe tener al menos 2 caracteres');
            }
            updateData.name = input.name.trim();
        }
        if (input.category !== undefined) {
            if (!input.category.trim()) {
                throw new Error('La categoría del producto es requerida');
            }
            updateData.category = input.category.trim();
        }
        if (input.price !== undefined) {
            if (Number.isNaN(input.price) || input.price < 0) {
                throw new Error('El precio debe ser mayor o igual a 0');
            }
            updateData.price = input.price;
        }
        if (input.stock !== undefined) {
            if (Number.isNaN(input.stock) || input.stock < 0) {
                throw new Error('El stock debe ser mayor o igual a 0');
            }
            updateData.stock = input.stock;
        }
        if (input.description !== undefined) {
            updateData.description = input.description.trim();
        }
        if (input.isActive !== undefined) {
            updateData.isActive = input.isActive;
        }
        if (input.ingredients !== undefined) {
            updateData.ingredients = input.ingredients?.map((ingredient) => ({
                name: ingredient.name.trim(),
                extraPrice: ingredient.extraPrice ?? 0,
                isDefault: ingredient.isDefault ?? false,
            })) || null;
        }
        if (input.additions !== undefined) {
            updateData.additions = input.additions?.map((addition) => ({
                name: addition.name.trim(),
                price: addition.price,
                description: addition.description?.trim(),
                isDefault: addition.isDefault ?? false,
            })) || null;
        }
        if (input.imageUrl !== undefined) {
            updateData.imageUrl = input.imageUrl;
        }
        if (input.imagePublicId !== undefined) {
            updateData.imagePublicId = input.imagePublicId;
        }
        const updated = await this.productRepo.update(productId, updateData);
        if (!updated) {
            throw new Error('PRODUCT_NOT_FOUND');
        }
        return updated;
    }
}
exports.UpdateProductUseCase = UpdateProductUseCase;
