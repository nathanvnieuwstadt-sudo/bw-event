package com.bwevent.agent.repository;

import com.bwevent.domain.enums.DraftStatus;
import com.bwevent.domain.model.AgentDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AgentDraftRepository extends JpaRepository<AgentDraft, UUID> {

    @Query("SELECT d FROM AgentDraft d JOIN FETCH d.emailThread LEFT JOIN FETCH d.banquet b LEFT JOIN FETCH b.contact WHERE d.restaurantId = :restaurantId ORDER BY d.createdAt DESC")
    List<AgentDraft> findAllByRestaurantIdOrderByCreatedAtDesc(@Param("restaurantId") UUID restaurantId);

    @Query("SELECT d FROM AgentDraft d JOIN FETCH d.emailThread LEFT JOIN FETCH d.banquet b LEFT JOIN FETCH b.contact WHERE d.restaurantId = :restaurantId AND d.status = :status ORDER BY d.createdAt DESC")
    List<AgentDraft> findAllByRestaurantIdAndStatusOrderByCreatedAtDesc(@Param("restaurantId") UUID restaurantId, @Param("status") DraftStatus status);
}
