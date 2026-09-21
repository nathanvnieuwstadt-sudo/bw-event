package com.bwevent.agent.dto;

import com.bwevent.domain.enums.CheckableRuleType;
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

    /** Null (the default) means this rule is prompt-only, not mechanically checked. */
    private CheckableRuleType checkableType;
}
