package com.bwevent.domain.model;

import com.bwevent.domain.enums.DraftStatus;
import com.bwevent.domain.enums.EmailClassification;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "agent_drafts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "email_thread_id", nullable = false)
    private EmailThread emailThread;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "banquet_id")
    private Banquet banquet;

    @Column(name = "draft_body", columnDefinition = "TEXT", nullable = false)
    private String draftBody;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DraftStatus status = DraftStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    // ── Generation + review audit trail (V10) ──────────────────────────────

    @Enumerated(EnumType.STRING)
    private EmailClassification classification;

    private BigDecimal confidence;

    @Column(name = "generation_prompt", columnDefinition = "TEXT")
    private String generationPrompt;

    @Column(name = "model_raw_output", columnDefinition = "TEXT")
    private String modelRawOutput;

    /** JSON snapshot of the enabled agent_instructions active when this draft was generated. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "rules_snapshot", columnDefinition = "jsonb")
    private String rulesSnapshot;

    /** JSON snapshot of the knowledge_base_entries available when this draft was generated. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "knowledge_base_snapshot", columnDefinition = "jsonb")
    private String knowledgeBaseSnapshot;

    /** JSON list of checkable-rule violations flagged by the post-generation validator, once it exists. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "rule_violations", columnDefinition = "jsonb")
    private String ruleViolations;

    /** The human-approved/edited version, if it differs from draftBody. Null until approved. */
    @Column(name = "final_body", columnDefinition = "TEXT")
    private String finalBody;

    @Column(name = "edit_diff", columnDefinition = "TEXT")
    private String editDiff;
}
