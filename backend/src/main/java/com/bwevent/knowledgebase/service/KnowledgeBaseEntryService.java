package com.bwevent.knowledgebase.service;

import com.bwevent.domain.model.KnowledgeBaseEntry;
import com.bwevent.knowledgebase.dto.KnowledgeBaseEntryRequest;
import com.bwevent.knowledgebase.dto.KnowledgeBaseEntryResponse;
import com.bwevent.knowledgebase.repository.KnowledgeBaseEntryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KnowledgeBaseEntryService {

    private final KnowledgeBaseEntryRepository repository;

    public List<KnowledgeBaseEntryResponse> listByRestaurant(UUID restaurantId) {
        return repository.findAllByRestaurantIdOrderByCategoryAscTitleAsc(restaurantId)
                .stream().map(KnowledgeBaseEntryResponse::from).toList();
    }

    @Transactional
    public KnowledgeBaseEntryResponse create(UUID restaurantId, UUID updatedBy, KnowledgeBaseEntryRequest request) {
        KnowledgeBaseEntry entry = KnowledgeBaseEntry.builder()
                .restaurantId(restaurantId)
                .category(request.getCategory())
                .title(request.getTitle())
                .content(request.getContent())
                .structuredValue(request.getStructuredValue())
                .updatedBy(updatedBy)
                .build();
        return KnowledgeBaseEntryResponse.from(repository.save(entry));
    }

    @Transactional
    public KnowledgeBaseEntryResponse update(UUID id, UUID updatedBy, KnowledgeBaseEntryRequest request) {
        KnowledgeBaseEntry entry = findOrThrow(id);
        entry.setCategory(request.getCategory());
        entry.setTitle(request.getTitle());
        entry.setContent(request.getContent());
        entry.setStructuredValue(request.getStructuredValue());
        entry.setUpdatedBy(updatedBy);
        return KnowledgeBaseEntryResponse.from(repository.save(entry));
    }

    @Transactional
    public void delete(UUID id) {
        repository.delete(findOrThrow(id));
    }

    private KnowledgeBaseEntry findOrThrow(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Knowledge base entry not found: " + id));
    }
}
