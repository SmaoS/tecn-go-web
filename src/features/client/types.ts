export interface ClientRequestForm {
  categoryId: string
  description: string
  address: string
  latitude: string
  longitude: string
  estimatedPrice: string
}

export interface RatingDraft {
  score: number
  comment: string
}
