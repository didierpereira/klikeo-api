import mongoose, { Schema, Document } from 'mongoose'
import { ProductDomain } from '../domain/Product'
import {
  CreateProductData,
  IProductRepository,
  ListProductsFilter,
  ListProductsResult,
  UpdateProductData,
} from './interfaces/IProductRepository'

interface ProductDoc extends Document {
  negocioId: mongoose.Types.ObjectId
  name: string
  description?: string
  category: string
  price: number
  stock: number
  imageUrl?: string
  imagePublicId?: string
  isActive: boolean
  isDeleted: boolean
  ingredients?: Array<{ name: string; extraPrice?: number; isDefault?: boolean }>
  additions?: Array<{ name: string; price: number; description?: string; isDefault?: boolean }>
  createdAt: Date
  updatedAt: Date
}

const IngredientSchema = new Schema(
  {
    name: { type: String, required: true },
    extraPrice: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
)

const AdditionSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
)

const ProductSchema = new Schema<ProductDoc>(
  {
    negocioId: { type: Schema.Types.ObjectId, ref: 'Negocio', required: true },
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
  },
  { timestamps: true },
)

ProductSchema.index({ name: 'text', description: 'text', category: 'text' })

export const ProductModel =
  (mongoose.models.Product as mongoose.Model<ProductDoc>) ||
  mongoose.model<ProductDoc>('Product', ProductSchema)

function toProductDomain(doc: ProductDoc): ProductDomain {
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
  }
}

export class ProductRepository implements IProductRepository {
  async findById(id: string): Promise<ProductDomain | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null
    const doc = await ProductModel.findById(id)
    return doc ? toProductDomain(doc) : null
  }

  async findByIdAndBusiness(id: string, negocioId: string): Promise<ProductDomain | null> {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(negocioId)) return null
    const doc = await ProductModel.findOne({ _id: id, negocioId })
    return doc ? toProductDomain(doc) : null
  }

  async listByBusiness(negocioId: string, filter: ListProductsFilter): Promise<ListProductsResult> {
    const page = filter.page ?? 1
    const limit = filter.limit ?? 20
    const skip = (page - 1) * limit
    const query: Record<string, unknown> = { negocioId, isDeleted: false }
    if (filter.onlyActive) {
      query.isActive = true
    }

    const [data, total] = await Promise.all([
      ProductModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProductModel.countDocuments(query),
    ])

    return {
      data: data.map(toProductDomain),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async create(data: CreateProductData): Promise<ProductDomain> {
    const doc = await ProductModel.create(data)
    return toProductDomain(doc)
  }

  async update(id: string, data: UpdateProductData): Promise<ProductDomain | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null
    const doc = await ProductModel.findByIdAndUpdate(id, data, { new: true })
    return doc ? toProductDomain(doc) : null
  }

  async softDelete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false
    const result = await ProductModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true })
    return Boolean(result)
  }
}
