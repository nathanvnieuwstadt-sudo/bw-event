package com.bwevent.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "menu_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "banquet_id", nullable = false)
    private Banquet banquet;

    @Column(name = "dish_name", nullable = false)
    private String dishName;

    @Column(nullable = false)
    private Integer quantity;

    private String notes;
}
