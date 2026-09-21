package com.bwevent.domain.model;

import com.bwevent.domain.enums.CheckableRuleType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "agent_instructions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentInstruction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String instruction;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private int displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "created_by")
    private UUID createdBy;

    /**
     * Which programmatic check (if any) validates this rule against source data
     * before a draft is shown for review — see CheckableRuleType. Null means the
     * rule is prompt-only: requested of the model, not mechanically guaranteed.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "checkable_type")
    private CheckableRuleType checkableType;
}
