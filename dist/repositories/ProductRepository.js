"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = exports.ProductModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const IngredientSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    extraPrice: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
}, { _id: false });
const AdditionSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String },
    isDefault: { type: Boolean, default: false },
}, { _id: false });
const ProductSchema = new mongoose_1.Schema({
    negocioId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Negocio', required: true },
    name: { type: String, required: true, minlength: 2 },
    description: { type: String, maxlength: 1000 },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    imageUrl: String,
    imagePublicId: String,
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    ingredients: { type: [IngredientSchema], default: undefined },
    additions: { type: [AdditionSchema], default: undefined },
}, { timestamps: true });
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });
exports.ProductModel = mongoose_1.default.models.Product ||
    mongoose_1.default.model('Product', ProductSchema);
function toProductDomain(doc) {
    return {
        id: doc._id.toString(),
        negocioId: doc.negocioId.toString(),
        name: doc.name,
        description: doc.description,
        category: doc.category,
        price: doc.price,
        stock: doc.stock,
        imageUrl: doc.imageUrl,
        imagePublicId: doc.imagePublicId,
        isActive: doc.isActive,
        isDeleted: doc.isDeleted,
        ingredients: doc.ingredients?.map((ingredient) => ({
            name: ingredient.name,
            extraPrice: ingredient.extraPrice,
            isDefault: ingredient.isDefault,
        })),
        additions: doc.additions?.map((addition) => ({
            name: addition.name,
            price: addition.price,
            description: addition.description,
            isDefault: addition.isDefault,
        })),
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}
class ProductRepository {
    async findById(id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return null;
        const doc = await exports.ProductModel.findById(id);
        return doc ? toProductDomain(doc) : null;
    }
    async findByIdAndBusiness(id, negocioId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id) || !mongoose_1.default.Types.ObjectId.isValid(negocioId))
            return null;
        const doc = await exports.ProductModel.findOne({ _id: id, negocioId });
        return doc ? toProductDomain(doc) : null;
    }
    async listByBusiness(negocioId, filter) {
        const page = filter.page ?? 1;
        const limit = filter.limit ?? 20;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            exports.ProductModel.find({ negocioId, isDeleted: false })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            exports.ProductModel.countDocuments({ negocioId, isDeleted: false }),
        ]);
        return {
            data: data.map(toProductDomain),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async create(data) {
        const doc = await exports.ProductModel.create(data);
        return toProductDomain(doc);
    }
    async update(id, data) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return null;
        const doc = await exports.ProductModel.findByIdAndUpdate(id, data, { new: true });
        return doc ? toProductDomain(doc) : null;
    }
    async softDelete(id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return false;
        const result = await exports.ProductModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        return Boolean(result);
    }
}
exports.ProductRepository = ProductRepository;
