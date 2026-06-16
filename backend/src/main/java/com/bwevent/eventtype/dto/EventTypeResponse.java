package com.bwevent.eventtype.dto;

import com.bwevent.domain.model.EventType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class EventTypeResponse {

    private UUID id;
    private UUID restaurantId;
    private String name;
    private String description;
    private List<EventTypeFieldResponse> fields;
    private Instant createdAt;

    public static EventTypeResponse from(EventType e) {
        return EventTypeResponse.builder()
                .id(e.getId())
                .restaurantId(e.getRestaurantId())
                .name(e.getName())
                .description(e.getDescription())
                .fields(e.getFields().stream().map(EventTypeFieldResponse::from).toList())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
