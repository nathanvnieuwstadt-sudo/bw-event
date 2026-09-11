package com.bwevent.agent.service;

import com.bwevent.domain.model.AgentInstruction;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Placeholder for real AI-generated replies. Builds a plausible French reply
 * from simple keyword/regex heuristics over the incoming message, informed by
 * the restaurant's enabled agent instructions.
 * <p>
 * Swap point for the real integration: once {@link ClaudeApiService} is
 * implemented, replace the caller's use of this class with a call to
 * {@code generateReplyDraft}/{@code generateReplyDraftWithEventTypes} instead.
 */
@Component
public class MockDraftGenerator {

    private static final Pattern HEADCOUNT_RE =
            Pattern.compile("(\\d{1,4})\\s*(invit[ée]s?|personnes?|convives?|guests?|people)", Pattern.CASE_INSENSITIVE);

    private static final List<String> DIETARY_KEYWORDS = List.of(
            "végétarien", "vegetarian", "végan", "vegan", "sans gluten", "gluten",
            "halal", "casher", "kosher", "allerg", "noix", "arachide", "nut"
    );

    public String generateDraft(String contactName, String subject, String messageBody, List<AgentInstruction> instructions) {
        String text = messageBody.toLowerCase(Locale.FRENCH);
        Matcher headcountMatch = HEADCOUNT_RE.matcher(messageBody);
        String headcount = headcountMatch.find() ? headcountMatch.group(1) : null;
        boolean dietaryHit = DIETARY_KEYWORDS.stream().anyMatch(text::contains);

        String firstName = contactName != null && !contactName.isBlank()
                ? contactName.split(" ")[0]
                : null;

        StringBuilder sb = new StringBuilder();
        sb.append(firstName != null ? "Bonjour " + firstName + "," : "Bonjour,").append("\n\n");

        sb.append("Merci pour votre message");
        if (subject != null && !subject.isBlank()) {
            sb.append(" concernant « ").append(subject).append(" »");
        }
        sb.append(". Nous serions ravis de vous accueillir.\n\n");

        if (headcount != null) {
            sb.append("Nous avons bien noté un nombre d'invités d'environ ").append(headcount).append(" personnes.\n");
        } else if (hasInstruction(instructions, "collect")) {
            sb.append("Afin de préparer une proposition adaptée, pourriez-vous nous préciser la date souhaitée, ")
              .append("le nombre d'invités estimé ainsi qu'un budget approximatif ?\n");
        }

        if (dietaryHit && hasInstruction(instructions, "diet")) {
            sb.append("Nous prenons bonne note de vos besoins alimentaires particuliers — notre cuisine saura les ")
              .append("accommoder avec la plus grande attention.\n");
        }

        if (hasInstruction(instructions, "deposit")) {
            sb.append("Pour rappel, un acompte de 30 % est demandé afin de confirmer définitivement la réservation.\n");
        }

        sb.append("\nN'hésitez pas à nous indiquer vos disponibilités pour un appel ou une visite des lieux.\n\n");
        sb.append("Cordialement,\nL'équipe");

        return sb.toString();
    }

    private boolean hasInstruction(List<AgentInstruction> instructions, String keyword) {
        return instructions.stream()
                .anyMatch(i -> i.isEnabled() && i.getTitle().toLowerCase(Locale.FRENCH).contains(keyword));
    }
}
