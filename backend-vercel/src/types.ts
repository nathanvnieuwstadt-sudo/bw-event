export type UserRole = "OWNER" | "GENERAL_MANAGER" | "FLOOR_MANAGER" | "KITCHEN" | "DEV";

export type BanquetStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";
export type BanquetSource = "MANUAL" | "EMAIL";
/** Placeholder venue names — swap for the restaurant's real 3 locations whenever convenient. */
export type BanquetLocation = "MAIN_HALL" | "PRIVATE_ROOM" | "TERRACE";
export type DraftStatus = "PENDING" | "APPROVED" | "REJECTED" | "SENT";
export type FieldType = "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT";
export type AgentMode = "APPROVAL" | "AUTONOMOUS";

export interface AuthContext {
  userId: string;
  email: string;
  role: UserRole;
  restaurantId: string | null;
}
