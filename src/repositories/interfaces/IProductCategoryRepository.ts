import { ProductCategoryDomain } from '../../domain/ProductCategory'

export interface CreateProductCategoryData {
  negocioId: string
  name: string
  isActive?: boolean
}

export interface UpdateProductCategoryData {
  name?: string
  isActive?: boolean
  isDeleted?: boolean
}

export interface ListProductCategoriesFilter {
  page?: number
  limit?: number
  onlyActive?: boolean
}

export interface ListProductCategoriesResult {
  data: ProductCategoryDomain[]
  total: number
  page: number
  totalPages: number
}

export interface IProductCategoryRepository {
  findById(id: string): Promise<ProductCategoryDomain | null>
  listByBusiness(negocioId: string, filter: ListProductCategoriesFilter): Promise<ListProductCategoriesResult>
  create(data: CreateProductCategoryData): Promise<ProductCategoryDomain>
  update(id: string, data: UpdateProductCategoryData): Promise<ProductCategoryDomain | null>
  softDelete(id: string): Promise<boolean>
  findByBusinessAndName(negocioId: string, name: string): Promise<ProductCategoryDomain | null>
}
