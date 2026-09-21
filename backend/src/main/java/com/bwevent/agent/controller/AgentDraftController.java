package com.bwevent.agent.controller;

import com.bwevent.agent.dto.AgentDraftResponse;
import com.bwevent.agent.service.AgentDraftService;
import com.bwevent.config.ApiResponse;
import com.bwevent.config.AuthPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/restaurants/{restaurantId}/agent/drafts")
@RequiredArgsConstructor
public class AgentDraftController {

    private final AgentDraftService agentDraftService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER', 'FLOOR_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<List<AgentDraftResponse>>> listAll(@PathVariable @P("restaurantId") UUID restaurantId) {
        return ResponseEntity.ok(ApiResponse.success(agentDraftService.listAll(restaurantId)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER', 'FLOOR_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<List<AgentDraftResponse>>> listPending(@PathVariable @P("restaurantId") UUID restaurantId) {
        return ResponseEntity.ok(ApiResponse.success(agentDraftService.listPending(restaurantId)));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER', 'FLOOR_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<AgentDraftResponse>> approve(@PathVariable @P("restaurantId") UUID restaurantId,
                                                                    @PathVariable UUID id,
                                                                    @AuthenticationPrincipal AuthPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(agentDraftService.approve(id, principal.getUserId())));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER', 'FLOOR_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<AgentDraftResponse>> reject(@PathVariable @P("restaurantId") UUID restaurantId,
                                                                   @PathVariable UUID id,
                                                                   @AuthenticationPrincipal AuthPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(agentDraftService.reject(id, principal.getUserId())));
    }
}
