package com.bwevent.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "gmail_connections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GmailConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "restaurant_id", nullable = false, unique = true)
    private UUID restaurantId;

    @Column(name = "gmail_email", nullable = false)
    private String gmailEmail;

    @Column(name = "encrypted_refresh_token", columnDefinition = "TEXT", nullable = false)
    private String encryptedRefreshToken;

    /** Gmail History API cursor — null until the first successful poll. */
    @Column(name = "history_id")
    private String historyId;

    @Column(name = "connected_by")
    private UUID connectedBy;

    @Column(name = "connected_at", updatable = false)
    private Instant connectedAt;

    @Column(name = "last_poll_at")
    private Instant lastPollAt;

    @Column(name = "last_poll_status")
    private String lastPollStatus;

    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;

    @PrePersist
    void onCreate() {
        if (connectedAt == null) connectedAt = Instant.now();
    }
}
