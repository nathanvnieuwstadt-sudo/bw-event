package com.bwevent.menu.controller;

import com.bwevent.config.ApiResponse;
import com.bwevent.menu.dto.MenuRequest;
import com.bwevent.menu.dto.MenuResponse;
import com.bwevent.menu.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/restaurants/{restaurantId}/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DEV', 'OWNER', 'GENERAL_MANAGER', 'FLOOR_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> list(@PathVariable @P("restaurantId") UUID restaurantId) {
        return ResponseEntity.ok(ApiResponse.success(menuService.listByRestaurant(restaurantId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'OWNER', 'GENERAL_MANAGER', 'FLOOR_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<MenuResponse>> getById(
            @PathVariable @P("restaurantId") UUID restaurantId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(menuService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<MenuResponse>> create(
            @PathVariable @P("restaurantId") UUID restaurantId,
            @Valid @RequestBody MenuRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(menuService.create(restaurantId, request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<MenuResponse>> update(
            @PathVariable @P("restaurantId") UUID restaurantId,
            @PathVariable UUID id,
            @Valid @RequestBody MenuRequest request) {
        return ResponseEntity.ok(ApiResponse.success(menuService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<Void> delete(
            @PathVariable @P("restaurantId") UUID restaurantId,
            @PathVariable UUID id) {
        menuService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
