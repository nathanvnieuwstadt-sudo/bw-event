package com.bwevent.knowledgebase.dto;

import com.bwevent.domain.enums.KnowledgeBaseCategory;
import com.bwevent.domain.model.KnowledgeBaseEntry;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class KnowledgeBaseEntryResponse {

    private UUID id;
    private UUID restaurantId;
    private KnowledgeBaseCategory category;
    private String title;
    private String content;
    private String structuredValue;
    private Instant updatedAt;
    private UUID updatedBy;

    public static KnowledgeBaseEntryResponse from(KnowledgeBaseEntry e) {
        return KnowledgeBaseEntryResponse.builder()
                .id(e.getId())
                .restaurantId(e.getRestaurantId())
                .category(e.getCategory())
                .title(e.getTitle())
                .content(e.getContent())
                .structuredValue(e.getStructuredValue())
                .updatedAt(e.getUpdatedAt())
                .updatedBy(e.getUpdatedBy())
                .build();
    }
}
