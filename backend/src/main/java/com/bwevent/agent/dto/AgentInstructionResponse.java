package com.bwevent.agent.dto;

import com.bwevent.domain.model.AgentInstruction;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class AgentInstructionResponse {
    private UUID id;
    private UUID restaurantId;
    private String title;
    private String instruction;
    private boolean enabled;
    private int displayOrder;
    private Instant createdAt;

    public static AgentInstructionResponse from(AgentInstruction i) {
        return AgentInstructionResponse.builder()
                .id(i.getId())
                .restaurantId(i.getRestaurantId())
                .title(i.getTitle())
                .instruction(i.getInstruction())
                .enabled(i.isEnabled())
                .displayOrder(i.getDisplayOrder())
                .createdAt(i.getCreatedAt())
                .build();
    }
}
