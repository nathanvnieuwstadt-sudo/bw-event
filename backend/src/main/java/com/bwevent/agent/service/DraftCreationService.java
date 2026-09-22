package com.bwevent.agent.service;

import com.bwevent.agent.dto.AgentDraftResponse;
import com.bwevent.agent.repository.AgentDraftRepository;
import com.bwevent.domain.enums.EmailClassification;
import com.bwevent.domain.model.AgentDraft;
import com.bwevent.domain.model.EmailThread;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Persists an AgentDraft with PENDING status.
 * <p>
 * In AUTONOMOUS mode (per restaurant setting) this will eventually skip the
 * review step and call GmailPollingService to send directly — not yet
 * implemented, since there is no real Gmail send path either.
 */
@Service
@RequiredArgsConstructor
public class DraftCreationService {

    private final AgentDraftRepository agentDraftRepository;

    /** The generation/review audit trail fields — see V10 migration. All nullable. */
    public record DraftMeta(
            EmailClassification classification,
            Double confidence,
            String generationPrompt,
            String modelRawOutput,
            String rulesSnapshot,
            String knowledgeBaseSnapshot) {
    }

    @Transactional
    public AgentDraftResponse createDraft(UUID restaurantId, EmailThread emailThread, String draftBody) {
        return createDraft(restaurantId, emailThread, draftBody, null);
    }

    @Transactional
    public AgentDraftResponse createDraft(
            UUID restaurantId, EmailThread emailThread, String draftBody, DraftMeta meta) {
        if (emailThread == null) {
            throw new EntityNotFoundException("EmailThread is required to create a draft");
        }
        AgentDraft.AgentDraftBuilder builder = AgentDraft.builder()
                .restaurantId(restaurantId)
                .emailThread(emailThread)
                .draftBody(draftBody);
        if (meta != null) {
            builder.classification(meta.classification())
                    .confidence(meta.confidence() != null ? BigDecimal.valueOf(meta.confidence()) : null)
                    .generationPrompt(meta.generationPrompt())
                    .modelRawOutput(meta.modelRawOutput())
                    .rulesSnapshot(meta.rulesSnapshot())
                    .knowledgeBaseSnapshot(meta.knowledgeBaseSnapshot());
        }
        return AgentDraftResponse.from(agentDraftRepository.save(builder.build()));
    }
}
