export interface ProductIngredient {
  name: string
  extraPrice?: number
  isDefault?: boolean
}

export interface ProductAddition {
  name: string
  price: number
  description?: string
  isDefault?: boolean
}

export interface ProductDomain {
  id: string
  negocioId: string
  name: string
  description?: string
  category: string
  price: number
  stock: number
  imageUrl?: string
  imagePublicId?: string
  isActive: boolean
  isDeleted: boolean
  ingredients?: ProductIngredient[]
  additions?: ProductAddition[]
  createdAt: Date
  updatedAt: Date
}
