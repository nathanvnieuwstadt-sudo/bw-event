package com.bwevent.agent.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AgentInstructionRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String instruction;

    private boolean enabled = true;

    private int displayOrder = 0;
}
