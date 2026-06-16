package com.bwevent.agent.controller;

import com.bwevent.agent.dto.AgentInstructionRequest;
import com.bwevent.agent.dto.AgentInstructionResponse;
import com.bwevent.agent.service.AgentInstructionService;
import com.bwevent.config.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/restaurants/{restaurantId}/agent/instructions")
@RequiredArgsConstructor
public class AgentInstructionController {

    private final AgentInstructionService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER', 'FLOOR_MANAGER')")
    public ResponseEntity<ApiResponse<List<AgentInstructionResponse>>> list(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(ApiResponse.success(service.listAll(restaurantId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER')")
    public ResponseEntity<ApiResponse<AgentInstructionResponse>> create(
            @PathVariable UUID restaurantId,
            @Valid @RequestBody AgentInstructionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(service.create(restaurantId, request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER')")
    public ResponseEntity<ApiResponse<AgentInstructionResponse>> update(
            @PathVariable UUID restaurantId,
            @PathVariable UUID id,
            @Valid @RequestBody AgentInstructionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER')")
    public ResponseEntity<Void> delete(
            @PathVariable UUID restaurantId,
            @PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
