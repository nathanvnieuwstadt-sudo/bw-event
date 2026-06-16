export type FieldType = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT'

export interface EventTypeField {
  id: string
  fieldKey: string
  fieldLabel: string
  fieldType: FieldType
  options: string[]
  required: boolean
  displayOrder: number
}

export interface EventType {
  id: string
  restaurantId: string
  name: string
  description: string | null
  fields: EventTypeField[]
  createdAt: string
}

export interface EventTypeFieldRequest {
  fieldLabel: string
  fieldType: FieldType
  options?: string
  required: boolean
  displayOrder: number
}

export interface EventTypeRequest {
  name: string
  description?: string
  fields: EventTypeFieldRequest[]
}
