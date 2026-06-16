package com.bwevent.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "banquet_field_values")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BanquetFieldValue {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "banquet_id", nullable = false)
    private UUID banquetId;

    @Column(name = "field_id", nullable = false)
    private UUID fieldId;

    @Column(columnDefinition = "TEXT")
    private String value;
}
