package com.bwevent.domain.model;

import com.bwevent.domain.enums.BanquetSource;
import com.bwevent.domain.enums.BanquetStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "banquets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banquet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    private Contact contact;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BanquetStatus status = BanquetStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BanquetSource source = BanquetSource.MANUAL;

    @Column(name = "event_date")
    private LocalDate date;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    private Integer headcount;

    @Column(precision = 10, scale = 2)
    private BigDecimal budget;

    @Column(name = "room_setup")
    private String roomSetup;

    @Column(name = "dietary_restrictions", columnDefinition = "TEXT")
    private String dietaryRestrictions;

    @Column(name = "av_needs", columnDefinition = "TEXT")
    private String avNeeds;

    @Column(name = "deposit_paid")
    @Builder.Default
    private Boolean depositPaid = false;

    @Column(name = "deposit_amount", precision = 10, scale = 2)
    private BigDecimal depositAmount;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "event_type_id")
    private UUID eventTypeId;

    @Column(name = "created_by")
    private UUID createdBy;

    @OneToMany(mappedBy = "banquet", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MenuItem> menuItems = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
