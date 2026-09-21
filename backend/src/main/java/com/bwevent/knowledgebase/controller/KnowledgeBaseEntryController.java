package com.bwevent.knowledgebase.controller;

import com.bwevent.config.ApiResponse;
import com.bwevent.config.AuthPrincipal;
import com.bwevent.knowledgebase.dto.KnowledgeBaseEntryRequest;
import com.bwevent.knowledgebase.dto.KnowledgeBaseEntryResponse;
import com.bwevent.knowledgebase.service.KnowledgeBaseEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/restaurants/{restaurantId}/agent/knowledge-base")
@RequiredArgsConstructor
public class KnowledgeBaseEntryController {

    private final KnowledgeBaseEntryService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER', 'FLOOR_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<List<KnowledgeBaseEntryResponse>>> list(@PathVariable @P("restaurantId") UUID restaurantId) {
        return ResponseEntity.ok(ApiResponse.success(service.listByRestaurant(restaurantId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<KnowledgeBaseEntryResponse>> create(
            @PathVariable @P("restaurantId") UUID restaurantId,
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody KnowledgeBaseEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(service.create(restaurantId, principal.getUserId(), request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<KnowledgeBaseEntryResponse>> update(
            @PathVariable @P("restaurantId") UUID restaurantId,
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody KnowledgeBaseEntryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.update(id, principal.getUserId(), request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<Void> delete(@PathVariable @P("restaurantId") UUID restaurantId, @PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
