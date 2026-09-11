package com.bwevent.agent.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class SimulateEmailRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message body is required")
    private String messageBody;

    private UUID contactId;
    private String senderName;
    private String senderEmail;
}
