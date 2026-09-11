import api from './client'
import type { AgentDraft, AgentInstruction, AgentInstructionRequest, SimulateEmailRequest } from '../types/agent'

export async function listDrafts(restaurantId: string): Promise<AgentDraft[]> {
  const res = await api.get(`/restaurants/${restaurantId}/agent/drafts`)
  return res.data.data
}

export async function simulateIncomingEmail(restaurantId: string, req: SimulateEmailRequest): Promise<AgentDraft> {
  const res = await api.post(`/restaurants/${restaurantId}/agent/threads`, req)
  return res.data.data
}

export async function listPendingDrafts(restaurantId: string): Promise<AgentDraft[]> {
  const res = await api.get(`/restaurants/${restaurantId}/agent/drafts/pending`)
  return res.data.data
}

export async function approveDraft(restaurantId: string, draftId: string): Promise<AgentDraft> {
  const res = await api.post(`/restaurants/${restaurantId}/agent/drafts/${draftId}/approve`)
  return res.data.data
}

export async function rejectDraft(restaurantId: string, draftId: string): Promise<AgentDraft> {
  const res = await api.post(`/restaurants/${restaurantId}/agent/drafts/${draftId}/reject`)
  return res.data.data
}

export async function listInstructions(restaurantId: string): Promise<AgentInstruction[]> {
  const res = await api.get(`/restaurants/${restaurantId}/agent/instructions`)
  return res.data.data
}

export async function createInstruction(restaurantId: string, req: AgentInstructionRequest): Promise<AgentInstruction> {
  const res = await api.post(`/restaurants/${restaurantId}/agent/instructions`, req)
  return res.data.data
}

export async function updateInstruction(restaurantId: string, id: string, req: AgentInstructionRequest): Promise<AgentInstruction> {
  const res = await api.put(`/restaurants/${restaurantId}/agent/instructions/${id}`, req)
  return res.data.data
}

export async function deleteInstruction(restaurantId: string, id: string): Promise<void> {
  await api.delete(`/restaurants/${restaurantId}/agent/instructions/${id}`)
}
