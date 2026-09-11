package com.bwevent.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "email_threads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailThread {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "banquet_id")
    private Banquet banquet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    private Contact contact;

    @Column(name = "sender_name")
    private String senderName;

    @Column(name = "sender_email")
    private String senderEmail;

    @Column(name = "gmail_thread_id")
    private String gmailThreadId;

    private String subject;

    @Column(name = "last_message_at")
    private Instant lastMessageAt;

    @Column(name = "last_message_body", columnDefinition = "TEXT")
    private String lastMessageBody;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
