// Placeholder for real AI-generated replies. Builds a plausible French reply
// from simple keyword/regex heuristics over the incoming message, informed by
// the restaurant's enabled agent instructions.
//
// Swap point for the real integration: replace the body of `generateDraft`
// with a call to the Claude API. The intended prompt shape (system prompt
// built from event types + agent instructions, user message = email thread)
// is documented in ../../../../backend/src/main/java/com/bwevent/agent/service/ClaudeApiService.java.

interface InstructionLike {
  title: string;
  instruction: string;
  enabled: boolean;
}

interface DraftInput {
  contactName: string | null;
  subject: string | null;
  messageBody: string;
  instructions: InstructionLike[];
}

const HEADCOUNT_RE = /(\d{1,4})\s*(invit[ée]s?|personnes?|convives?|guests?|people)/i;
const DIETARY_KEYWORDS = [
  "végétarien", "vegetarian", "végan", "vegan", "sans gluten", "gluten",
  "halal", "casher", "kosher", "allerg", "noix", "arachide", "nut",
];

function hasInstruction(instructions: InstructionLike[], keyword: string): boolean {
  return instructions.some(
    (i) => i.enabled && i.title.toLowerCase().includes(keyword),
  );
}

export function generateDraft({ contactName, subject, messageBody, instructions }: DraftInput): string {
  const text = messageBody.toLowerCase();
  const headcountMatch = messageBody.match(HEADCOUNT_RE);
  const headcount = headcountMatch ? headcountMatch[1] : null;
  const dietaryHits = DIETARY_KEYWORDS.filter((k) => text.includes(k));

  const firstName = contactName?.split(" ")[0];
  const lines: string[] = [firstName ? `Bonjour ${firstName},` : "Bonjour,", ""];

  lines.push(
    `Merci pour votre message${subject ? ` concernant « ${subject} »` : ""}. Nous serions ravis de vous accueillir.`,
    "",
  );

  if (headcount) {
    lines.push(`Nous avons bien noté un nombre d'invités d'environ ${headcount} personnes.`);
  } else if (hasInstruction(instructions, "collect")) {
    lines.push(
      "Afin de préparer une proposition adaptée, pourriez-vous nous préciser la date souhaitée, le nombre d'invités estimé ainsi qu'un budget approximatif ?",
    );
  }

  if (dietaryHits.length > 0 && hasInstruction(instructions, "diet")) {
    lines.push(
      `Nous prenons bonne note de vos besoins alimentaires particuliers — notre cuisine saura les accommoder avec la plus grande attention.`,
    );
  }

  if (hasInstruction(instructions, "deposit")) {
    lines.push("Pour rappel, un acompte de 30 % est demandé afin de confirmer définitivement la réservation.");
  }

  lines.push(
    "",
    "N'hésitez pas à nous indiquer vos disponibilités pour un appel ou une visite des lieux.",
    "",
    "Cordialement,",
    "L'équipe",
  );

  return lines.join("\n");
}
