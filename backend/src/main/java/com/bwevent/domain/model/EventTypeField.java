package com.bwevent.domain.model;

import com.bwevent.domain.enums.FieldType;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "event_type_fields")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventTypeField {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_type_id", nullable = false)
    private EventType eventType;

    @Column(name = "field_key", nullable = false)
    private String fieldKey;

    @Column(name = "field_label", nullable = false)
    private String fieldLabel;

    @Enumerated(EnumType.STRING)
    @Column(name = "field_type", nullable = false)
    @Builder.Default
    private FieldType fieldType = FieldType.TEXT;

    /** Comma-separated option values, used when fieldType = SELECT */
    @Column(columnDefinition = "TEXT")
    private String options;

    @Column(nullable = false)
    @Builder.Default
    private Boolean required = false;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;
}
