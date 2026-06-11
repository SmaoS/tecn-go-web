export interface LegalDocument {
  id: string
  code: string
  title: string
  version: string
  roleTarget: 'CLIENT' | 'TECHNICIAN' | 'ALL'
  content: string
  active: boolean
  accepted: boolean
}
