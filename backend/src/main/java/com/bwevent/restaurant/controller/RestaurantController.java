package com.bwevent.restaurant.controller;

import com.bwevent.config.ApiResponse;
import com.bwevent.restaurant.dto.RestaurantResponse;
import com.bwevent.restaurant.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'OWNER', 'GENERAL_MANAGER', 'FLOOR_MANAGER', 'KITCHEN') and @tenantGuard.check(#id)")
    public ResponseEntity<ApiResponse<RestaurantResponse>> getById(@PathVariable @P("id") UUID id) {
        return ResponseEntity.ok(ApiResponse.success(restaurantService.getById(id)));
    }
}
