package com.bwevent.agent.repository;

import com.bwevent.domain.model.AgentInstruction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AgentInstructionRepository extends JpaRepository<AgentInstruction, UUID> {
    List<AgentInstruction> findAllByRestaurantIdOrderByDisplayOrderAscCreatedAtAsc(UUID restaurantId);
}
