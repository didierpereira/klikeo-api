import mongoose, { Schema, Document } from 'mongoose'
import { ProductCategoryDomain } from '../domain/ProductCategory'
import {
  CreateProductCategoryData,
  IProductCategoryRepository,
  ListProductCategoriesFilter,
  ListProductCategoriesResult,
  UpdateProductCategoryData,
} from './interfaces/IProductCategoryRepository'

interface ProductCategoryDoc extends Document {
  negocioId: mongoose.Types.ObjectId
  name: string
  isActive: boolean
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductCategorySchema = new Schema<ProductCategoryDoc>(
  {
    negocioId: { type: Schema.Types.ObjectId, ref: 'Negocio', required: true },
    name: { type: String, required: true, minlength: 2 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
)

ProductCategorySchema.index({ negocioId: 1, name: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } })

export const ProductCategoryModel =
  (mongoose.models.ProductCategory as mongoose.Model<ProductCategoryDoc>) ||
  mongoose.model<ProductCategoryDoc>('ProductCategory', ProductCategorySchema)

function toProductCategoryDomain(doc: ProductCategoryDoc): ProductCategoryDomain {
  return {
    id: doc._id.toString(),
    negocioId: doc.negocioId.toString(),
    name: doc.name,
    isActive: doc.isActive,
    isDeleted: doc.isDeleted,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export class ProductCategoryRepository implements IProductCategoryRepository {
  async findById(id: string): Promise<ProductCategoryDomain | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null
    const doc = await ProductCategoryModel.findById(id)
    return doc ? toProductCategoryDomain(doc) : null
  }

  async listByBusiness(negocioId: string, filter: ListProductCategoriesFilter): Promise<ListProductCategoriesResult> {
    const page = filter.page ?? 1
    const limit = filter.limit ?? 20
    const skip = (page - 1) * limit

    const query: Record<string, unknown> = {
      negocioId,
      isDeleted: false,
    }

    if (filter.onlyActive) {
      query.isActive = true
    }

    const [data, total] = await Promise.all([
      ProductCategoryModel.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      ProductCategoryModel.countDocuments(query),
    ])

    return {
      data: data.map(toProductCategoryDomain),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    }
  }

  async create(data: CreateProductCategoryData): Promise<ProductCategoryDomain> {
    const doc = await ProductCategoryModel.create(data)
    return toProductCategoryDomain(doc)
  }

  async update(id: string, data: UpdateProductCategoryData): Promise<ProductCategoryDomain | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null
    const doc = await ProductCategoryModel.findByIdAndUpdate(id, data, { new: true })
    return doc ? toProductCategoryDomain(doc) : null
  }

  async softDelete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false
    const result = await ProductCategoryModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true })
    return Boolean(result)
  }

  async findByBusinessAndName(negocioId: string, name: string): Promise<ProductCategoryDomain | null> {
    return ProductCategoryModel.findOne({ negocioId, name, isDeleted: false }).then((doc) => (doc ? toProductCategoryDomain(doc) : null))
  }
}
