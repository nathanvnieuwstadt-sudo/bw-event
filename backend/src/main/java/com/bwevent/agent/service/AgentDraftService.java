package com.bwevent.agent.service;

import com.bwevent.agent.dto.AgentDraftResponse;
import com.bwevent.agent.repository.AgentDraftRepository;
import com.bwevent.domain.enums.DraftStatus;
import com.bwevent.domain.model.AgentDraft;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgentDraftService {

    private final AgentDraftRepository agentDraftRepository;

    public List<AgentDraftResponse> listPending(UUID restaurantId) {
        return agentDraftRepository
                .findAllByRestaurantIdAndStatusOrderByCreatedAtDesc(restaurantId, DraftStatus.PENDING)
                .stream().map(AgentDraftResponse::from).toList();
    }

    public List<AgentDraftResponse> listAll(UUID restaurantId) {
        return agentDraftRepository
                .findAllByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .stream().map(AgentDraftResponse::from).toList();
    }

    @Transactional
    public AgentDraftResponse approve(UUID id, UUID reviewerId) {
        AgentDraft draft = findOrThrow(id);
        draft.setStatus(DraftStatus.APPROVED);
        draft.setReviewedBy(reviewerId);
        draft.setReviewedAt(Instant.now());
        return AgentDraftResponse.from(agentDraftRepository.save(draft));
    }

    @Transactional
    public AgentDraftResponse reject(UUID id, UUID reviewerId) {
        AgentDraft draft = findOrThrow(id);
        draft.setStatus(DraftStatus.REJECTED);
        draft.setReviewedBy(reviewerId);
        draft.setReviewedAt(Instant.now());
        return AgentDraftResponse.from(agentDraftRepository.save(draft));
    }

    private AgentDraft findOrThrow(UUID id) {
        return agentDraftRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("AgentDraft not found: " + id));
    }
}
