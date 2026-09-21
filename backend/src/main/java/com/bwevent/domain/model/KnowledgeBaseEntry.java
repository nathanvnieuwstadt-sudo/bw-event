package com.bwevent.domain.model;

import com.bwevent.domain.enums.KnowledgeBaseCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "knowledge_base_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeBaseEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KnowledgeBaseCategory category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    /**
     * Raw JSON — a price, a date, whatever a programmatic rule check needs to
     * compare against (see CheckableRuleType). Null when the entry is
     * descriptive-only and only ever used as prompt context.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "structured_value", columnDefinition = "jsonb")
    private String structuredValue;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "updated_by")
    private UUID updatedBy;
}
