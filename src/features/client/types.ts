export interface ClientRequestForm {
  categoryId: string
  description: string
  address: string
  latitude: string
  longitude: string
  estimatedPrice: string
  paymentMethod: PaymentMethod
}

export type PaymentMethod = 'CASH' | 'BREB' | 'NEQUI' | 'DAVIPLATA' | 'BANCOLOMBIA' | 'DAVIVIENDA'

export interface RatingDraft {
  score: number
  comment: string
}
