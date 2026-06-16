export type DraftStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SENT'
export type AgentMode = 'APPROVAL' | 'AUTONOMOUS'

export interface AgentDraft {
  id: string
  restaurantId: string
  emailThreadId: string
  emailSubject: string | null
  emailSenderMessage: string | null
  emailLastMessageAt: string | null
  banquetId: string | null
  contactName: string | null
  draftBody: string
  status: DraftStatus
  createdAt: string
  reviewedBy: string | null
  reviewedAt: string | null
}

export interface AgentInstruction {
  id: string
  restaurantId: string
  title: string
  instruction: string
  enabled: boolean
  displayOrder: number
  createdAt: string
}

export interface AgentInstructionRequest {
  title: string
  instruction: string
  enabled: boolean
  displayOrder: number
}
