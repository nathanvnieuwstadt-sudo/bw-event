package com.bwevent.agent.service;

import com.bwevent.agent.repository.AgentInstructionRepository;
import com.bwevent.domain.model.AgentInstruction;
import com.bwevent.domain.model.KnowledgeBaseEntry;
import com.bwevent.eventtype.dto.EventTypeResponse;
import com.bwevent.eventtype.repository.EventTypeRepository;
import com.bwevent.knowledgebase.repository.KnowledgeBaseEntryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Shared "fetch context, call Claude, fall back to the mock generator" logic
 * used by both the simulate-email path (AgentThreadService) and the real
 * Gmail ingestion path (GmailPollingService), so the two don't duplicate it.
 */
@Service
@RequiredArgsConstructor
public class DraftGenerationService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final EventTypeRepository eventTypeRepository;
    private final AgentInstructionRepository agentInstructionRepository;
    private final KnowledgeBaseEntryRepository knowledgeBaseEntryRepository;
    private final ClaudeApiService claudeApiService;
    private final MockDraftGenerator mockDraftGenerator;

    public record Result(String draftBody, DraftCreationService.DraftMeta meta) {}

    public Result generate(UUID restaurantId, String contactName, String subject, String messageBody) {
        List<AgentInstruction> enabledInstructions = agentInstructionRepository
                .findAllByRestaurantIdOrderByDisplayOrderAscCreatedAtAsc(restaurantId)
                .stream().filter(AgentInstruction::isEnabled).toList();

        List<EventTypeResponse> eventTypes = eventTypeRepository.findAllByRestaurantIdOrderByNameAsc(restaurantId)
                .stream().map(EventTypeResponse::from).toList();

        List<KnowledgeBaseEntry> knowledgeBase = knowledgeBaseEntryRepository
                .findAllByRestaurantIdOrderByCategoryAscTitleAsc(restaurantId);

        String claudeDraft = claudeApiService.generateReplyDraft(
                contactName, subject, messageBody, eventTypes, enabledInstructions, knowledgeBase);

        if (claudeDraft != null) {
            String prompt = claudeApiService.buildSystemPrompt(eventTypes, enabledInstructions, knowledgeBase);
            DraftCreationService.DraftMeta meta = new DraftCreationService.DraftMeta(
                    null, null, // classification/confidence: set by the caller when it knows them (Gmail ingestion)
                    prompt,
                    claudeDraft,
                    toJson(enabledInstructions.stream()
                            .map(i -> Map.of("id", i.getId().toString(), "title", i.getTitle())).toList()),
                    toJson(knowledgeBase.stream()
                            .map(k -> Map.of("id", k.getId().toString(), "title", k.getTitle())).toList()));
            return new Result(claudeDraft, meta);
        }

        String mockDraft = mockDraftGenerator.generateDraft(contactName, subject, messageBody, enabledInstructions);
        return new Result(mockDraft, null);
    }

    private String toJson(Object value) {
        try {
            return MAPPER.writeValueAsString(value);
        } catch (Exception e) {
            return null;
        }
    }
}
