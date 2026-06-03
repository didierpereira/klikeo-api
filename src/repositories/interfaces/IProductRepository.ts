import { ProductAddition, ProductDomain, ProductIngredient } from '../../domain/Product'

export interface CreateProductData {
  negocioId: string
  name: string
  description?: string
  category: string
  price: number
  stock: number
  imageUrl?: string
  imagePublicId?: string
  isActive?: boolean
  ingredients?: ProductIngredient[]
  additions?: ProductAddition[]
}

export interface UpdateProductData {
  name?: string
  description?: string
  category?: string
  price?: number
  stock?: number
  imageUrl?: string | null
  imagePublicId?: string | null
  isActive?: boolean
  ingredients?: ProductIngredient[] | null
  additions?: ProductAddition[] | null
  isDeleted?: boolean
}

export interface ListProductsFilter {
  page?: number
  limit?: number
}

export interface ListProductsResult {
  data: ProductDomain[]
  total: number
  page: number
  totalPages: number
}

export interface IProductRepository {
  findById(id: string): Promise<ProductDomain | null>
  findByIdAndBusiness(id: string, negocioId: string): Promise<ProductDomain | null>
  listByBusiness(negocioId: string, filter: ListProductsFilter): Promise<ListProductsResult>
  create(data: CreateProductData): Promise<ProductDomain>
  update(id: string, data: UpdateProductData): Promise<ProductDomain | null>
  softDelete(id: string): Promise<boolean>
}
