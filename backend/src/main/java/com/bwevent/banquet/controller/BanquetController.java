package com.bwevent.banquet.controller;

import com.bwevent.banquet.dto.BanquetRequest;
import com.bwevent.banquet.dto.BanquetResponse;
import com.bwevent.banquet.dto.BanquetSummary;
import com.bwevent.banquet.service.BanquetService;
import com.bwevent.config.ApiResponse;
import com.bwevent.config.AuthPrincipal;
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
@RequestMapping("/restaurants/{restaurantId}/banquets")
@RequiredArgsConstructor
public class BanquetController {

    private final BanquetService banquetService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DEV', 'OWNER', 'GENERAL_MANAGER', 'FLOOR_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<List<BanquetSummary>>> list(@PathVariable @P("restaurantId") UUID restaurantId) {
        return ResponseEntity.ok(ApiResponse.success(banquetService.listByRestaurant(restaurantId)));
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('DEV', 'OWNER', 'GENERAL_MANAGER', 'FLOOR_MANAGER', 'KITCHEN') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<List<BanquetSummary>>> upcoming(
            @PathVariable @P("restaurantId") UUID restaurantId,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success(banquetService.listUpcoming(restaurantId, days)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'OWNER', 'GENERAL_MANAGER', 'FLOOR_MANAGER', 'KITCHEN') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<BanquetResponse>> getById(@PathVariable @P("restaurantId") UUID restaurantId,
                                                                  @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(banquetService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER', 'FLOOR_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<BanquetResponse>> create(
            @PathVariable @P("restaurantId") UUID restaurantId,
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody BanquetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(banquetService.create(restaurantId, principal.getUserId(), request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER', 'FLOOR_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<BanquetResponse>> update(
            @PathVariable @P("restaurantId") UUID restaurantId,
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody BanquetRequest request) {
        return ResponseEntity.ok(ApiResponse.success(banquetService.update(id, restaurantId, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<Void> delete(@PathVariable @P("restaurantId") UUID restaurantId, @PathVariable UUID id) {
        banquetService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
