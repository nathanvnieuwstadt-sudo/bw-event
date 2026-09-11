package com.bwevent.agent.service;

import com.bwevent.agent.dto.AgentDraftResponse;
import com.bwevent.agent.repository.AgentDraftRepository;
import com.bwevent.domain.model.AgentDraft;
import com.bwevent.domain.model.EmailThread;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public AgentDraftResponse createDraft(UUID restaurantId, EmailThread emailThread, String draftBody) {
        if (emailThread == null) {
            throw new EntityNotFoundException("EmailThread is required to create a draft");
        }
        AgentDraft draft = AgentDraft.builder()
                .restaurantId(restaurantId)
                .emailThread(emailThread)
                .draftBody(draftBody)
                .build();
        return AgentDraftResponse.from(agentDraftRepository.save(draft));
    }
}
