package com.bwevent.domain.model;

import com.bwevent.domain.enums.DraftStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

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
}
