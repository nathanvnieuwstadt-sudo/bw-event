import Anthropic from "@anthropic-ai/sdk";
import { env } from "../../env.js";

export interface EventTypeSummary {
  name: string;
  fieldLabels: string[];
}

export interface InstructionSummary {
  title: string;
  instruction: string;
}

export interface DraftGenerationInput {
  contactName: string | null;
  subject: string | null;
  messageBody: string;
  eventTypes: EventTypeSummary[];
  instructions: InstructionSummary[];
}

let client: Anthropic | null | undefined;

function getClient(): Anthropic | null {
  if (client !== undefined) return client;
  client = env.claudeApiKey ? new Anthropic({ apiKey: env.claudeApiKey }) : null;
  return client;
}

export function isConfigured(): boolean {
  return getClient() !== null;
}

function buildSystemPrompt(eventTypes: EventTypeSummary[], instructions: InstructionSummary[]): string {
  const lines = [
    "You manage banquet and private-event bookings for a restaurant. You are drafting a reply to an " +
      "inbound enquiry email on the restaurant's behalf, for a staff member to review before sending.",
    "",
    "Reply in the same language the enquiry was written in. Keep it warm, professional, and concise — " +
      "a real email a person would send, not a form letter. Sign off as \"L'équipe\" (or the local " +
      "equivalent for the enquiry's language) since you don't know the restaurant's exact house style.",
    "Do not invent specific prices, dates, or availability you were not given — ask for missing details " +
      "instead of guessing them.",
    "Output only the email body text. No subject line, no commentary, no markdown formatting.",
  ];

  if (eventTypes.length > 0) {
    lines.push(
      "",
      "Event types this restaurant hosts, and the information staff need collected for each:",
      ...eventTypes.map((et) => `- ${et.name}${et.fieldLabels.length ? `: ${et.fieldLabels.join(", ")}` : ""}`),
    );
  }

  if (instructions.length > 0) {
    lines.push(
      "",
      "House rules to follow when drafting this reply:",
      ...instructions.map((i) => `- ${i.title}: ${i.instruction}`),
    );
  }

  return lines.join("\n");
}

/**
 * Calls the real Claude API to draft a reply. Returns null (never throws) if
 * no API key is configured or the call fails, so callers can fall back to
 * MockDraftGenerator without the request failing.
 */
export async function generateReplyDraft(input: DraftGenerationInput): Promise<string | null> {
  const anthropic = getClient();
  if (!anthropic) return null;

  const userMessage = [
    input.subject ? `Subject: ${input.subject}` : null,
    input.contactName ? `From: ${input.contactName}` : null,
    "",
    input.messageBody,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      system: buildSystemPrompt(input.eventTypes, input.instructions),
      messages: [{ role: "user", content: userMessage }],
    });

    if (response.stop_reason === "refusal") {
      console.error("Claude declined to draft a reply", response.stop_details);
      return null;
    }

    const text = response.content.find((block) => block.type === "text");
    return text ? text.text.trim() : null;
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Claude API authentication failed — check CLAUDE_API_KEY", error.message);
    } else if (error instanceof Anthropic.RateLimitError) {
      console.error("Claude API rate limited", error.message);
    } else if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error ${error.status}`, error.message);
    } else {
      console.error("Unexpected error calling Claude API", error);
    }
    return null;
  }
}
