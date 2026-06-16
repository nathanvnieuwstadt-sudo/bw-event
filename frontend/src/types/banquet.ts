import type { Contact } from './contact'
import type { EventType } from './eventType'

export type BanquetStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED'
export type BanquetSource = 'MANUAL' | 'EMAIL'

export interface MenuItem {
  id: string
  dishName: string
  quantity: number
  notes: string | null
}

export interface MenuItemRequest {
  dishName: string
  quantity: number
  notes?: string
}

export interface BanquetSummary {
  id: string
  status: BanquetStatus
  source: BanquetSource
  date: string | null
  startTime: string | null
  endTime: string | null
  headcount: number | null
  contactName: string | null
  contactOrganization: string | null
}

export interface Banquet {
  id: string
  restaurantId: string
  contact: Contact | null
  status: BanquetStatus
  source: BanquetSource
  date: string | null
  startTime: string | null
  endTime: string | null
  headcount: number | null
  budget: number | null
  roomSetup: string | null
  dietaryRestrictions: string | null
  avNeeds: string | null
  depositPaid: boolean
  depositAmount: number | null
  notes: string | null
  createdBy: string | null
  menuItems: MenuItem[]
  eventType: EventType | null
  /** fieldId → value */
  fieldValues: Record<string, string>
  createdAt: string
  updatedAt: string
}

export interface BanquetRequest {
  contactId?: string
  status?: BanquetStatus
  source?: BanquetSource
  date?: string
  startTime?: string
  endTime?: string
  headcount?: number
  budget?: number
  roomSetup?: string
  dietaryRestrictions?: string
  avNeeds?: string
  depositPaid?: boolean
  depositAmount?: number
  notes?: string
  menuItems?: MenuItemRequest[]
  eventTypeId?: string
  /** fieldId → value */
  fieldValues?: Record<string, string>
}
