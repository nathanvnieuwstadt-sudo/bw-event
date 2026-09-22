package com.bwevent.domain.model;

import com.bwevent.domain.enums.EmailClassification;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * One row per email the Gmail poller has ever seen for a restaurant, regardless
 * of classification — the ledger that lets staff audit "did we see everything"
 * against the real inbox (see CLAUDE.md Agent Architecture).
 */
@Entity
@Table(name = "processed_emails")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessedEmail {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    @Column(name = "gmail_message_id", nullable = false)
    private String gmailMessageId;

    @Column(name = "gmail_thread_id")
    private String gmailThreadId;

    private String subject;

    @Column(name = "sender_name")
    private String senderName;

    @Column(name = "sender_email")
    private String senderEmail;

    @Column(name = "received_at")
    private Instant receivedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailClassification classification;

    private java.math.BigDecimal confidence;

    @Column(name = "email_thread_id")
    private UUID emailThreadId;

    @Column(name = "processed_at", updatable = false)
    private Instant processedAt;

    @PrePersist
    void onCreate() {
        if (processedAt == null) processedAt = Instant.now();
    }
}
