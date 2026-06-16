package com.bwevent.restaurant.dto;

import com.bwevent.domain.enums.AgentMode;
import com.bwevent.domain.model.Restaurant;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class RestaurantResponse {
    private UUID id;
    private String name;
    private AgentMode agentMode;
    private Instant createdAt;

    public static RestaurantResponse from(Restaurant r) {
        return RestaurantResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .agentMode(r.getAgentMode())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
