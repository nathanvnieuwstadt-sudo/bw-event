package com.bwevent.agent.service;

import com.bwevent.agent.dto.AgentInstructionRequest;
import com.bwevent.agent.dto.AgentInstructionResponse;
import com.bwevent.agent.repository.AgentInstructionRepository;
import com.bwevent.domain.model.AgentInstruction;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgentInstructionService {

    private final AgentInstructionRepository repo;

    public List<AgentInstructionResponse> listAll(UUID restaurantId) {
        return repo.findAllByRestaurantIdOrderByDisplayOrderAscCreatedAtAsc(restaurantId)
                .stream().map(AgentInstructionResponse::from).toList();
    }

    @Transactional
    public AgentInstructionResponse create(UUID restaurantId, AgentInstructionRequest req) {
        AgentInstruction i = AgentInstruction.builder()
                .restaurantId(restaurantId)
                .title(req.getTitle())
                .instruction(req.getInstruction())
                .enabled(req.isEnabled())
                .displayOrder(req.getDisplayOrder())
                .build();
        return AgentInstructionResponse.from(repo.save(i));
    }

    @Transactional
    public AgentInstructionResponse update(UUID id, AgentInstructionRequest req) {
        AgentInstruction i = findOrThrow(id);
        i.setTitle(req.getTitle());
        i.setInstruction(req.getInstruction());
        i.setEnabled(req.isEnabled());
        i.setDisplayOrder(req.getDisplayOrder());
        return AgentInstructionResponse.from(repo.save(i));
    }

    @Transactional
    public void delete(UUID id) {
        repo.deleteById(id);
    }

    private AgentInstruction findOrThrow(UUID id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("AgentInstruction not found: " + id));
    }
}
