export type ProductCategory = 'educativo' | 'datas_especiais' | 'papelaria'
export type OrderStatus = 'pending' | 'paid' | 'failed'

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  category: ProductCategory
  age_range: string | null
  theme: string | null
  cover_image_url: string | null
  pdf_storage_path: string | null
  is_active: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string | null
  product_id: string
  status: OrderStatus
  mp_payment_id: string | null
  amount: number
  buyer_name: string | null
  buyer_email: string | null
  buyer_cpf: string | null
  created_at: string
  paid_at: string | null
  products?: Product
}

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  is_admin: boolean
  created_at: string
}

export interface CheckoutPayload {
  productId: string
  name: string
  email: string
  cpf: string
}

export interface CheckoutResponse {
  orderId: string
  qrCode: string
  qrCodeBase64: string
  expiresAt: string
}
