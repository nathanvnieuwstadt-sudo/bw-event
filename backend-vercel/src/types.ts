export type UserRole = "OWNER" | "GENERAL_MANAGER" | "FLOOR_MANAGER" | "KITCHEN" | "DEV";

export type BanquetStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";
export type BanquetSource = "MANUAL" | "EMAIL";
export type DraftStatus = "PENDING" | "APPROVED" | "REJECTED" | "SENT";
export type FieldType = "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT";
export type AgentMode = "APPROVAL" | "AUTONOMOUS";

export interface AuthContext {
  userId: string;
  email: string;
  role: UserRole;
  restaurantId: string | null;
}
