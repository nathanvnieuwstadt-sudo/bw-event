package com.bwevent.agent.controller;

import com.bwevent.agent.dto.AgentDraftResponse;
import com.bwevent.agent.dto.SimulateEmailRequest;
import com.bwevent.agent.service.AgentThreadService;
import com.bwevent.config.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/restaurants/{restaurantId}/agent/threads")
@RequiredArgsConstructor
public class AgentThreadController {

    private final AgentThreadService agentThreadService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER', 'FLOOR_MANAGER')")
    public ResponseEntity<ApiResponse<AgentDraftResponse>> simulate(@PathVariable UUID restaurantId,
                                                                     @Valid @RequestBody SimulateEmailRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(agentThreadService.simulateIncomingEmail(restaurantId, request)));
    }
}
