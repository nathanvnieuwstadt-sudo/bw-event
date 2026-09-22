package com.bwevent.agent.repository;

import com.bwevent.domain.model.PipelineHealthEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PipelineHealthEventRepository extends JpaRepository<PipelineHealthEvent, UUID> {
    List<PipelineHealthEvent> findTop20ByRestaurantIdOrderByOccurredAtDesc(UUID restaurantId);
}
