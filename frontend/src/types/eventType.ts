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

export interface EventTypeMenuItem {
  id: string
  dishName: string
  description: string | null
  displayOrder: number
}

export interface EventTypeMenu {
  id: string
  name: string
  description: string | null
  displayOrder: number
  items: EventTypeMenuItem[]
}

export interface EventType {
  id: string
  restaurantId: string
  name: string
  description: string | null
  fields: EventTypeField[]
  menus: EventTypeMenu[]
  createdAt: string
}

export interface EventTypeFieldRequest {
  fieldLabel: string
  fieldType: FieldType
  options?: string
  required: boolean
  displayOrder: number
}

export interface EventTypeMenuItemRequest {
  dishName: string
  description?: string
  displayOrder: number
}

export interface EventTypeMenuRequest {
  name: string
  description?: string
  displayOrder: number
  items: EventTypeMenuItemRequest[]
}

export interface EventTypeRequest {
  name: string
  description?: string
  fields: EventTypeFieldRequest[]
  menus: EventTypeMenuRequest[]
}
