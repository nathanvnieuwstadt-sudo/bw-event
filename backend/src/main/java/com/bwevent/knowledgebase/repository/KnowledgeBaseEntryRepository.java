package com.bwevent.knowledgebase.repository;

import com.bwevent.domain.model.KnowledgeBaseEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface KnowledgeBaseEntryRepository extends JpaRepository<KnowledgeBaseEntry, UUID> {
    List<KnowledgeBaseEntry> findAllByRestaurantIdOrderByCategoryAscTitleAsc(UUID restaurantId);
}
