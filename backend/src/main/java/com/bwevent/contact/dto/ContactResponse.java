package com.bwevent.contact.dto;

import com.bwevent.domain.model.Contact;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ContactResponse {
    private UUID id;
    private UUID restaurantId;
    private String name;
    private String email;
    private String phone;
    private String organization;
    private Instant createdAt;
    private Instant updatedAt;

    public static ContactResponse from(Contact c) {
        return ContactResponse.builder()
                .id(c.getId())
                .restaurantId(c.getRestaurantId())
                .name(c.getName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .organization(c.getOrganization())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
