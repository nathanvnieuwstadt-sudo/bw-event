package com.bwevent.user.controller;

import com.bwevent.config.ApiResponse;
import com.bwevent.config.AuthPrincipal;
import com.bwevent.user.dto.CreateStaffRequest;
import com.bwevent.user.dto.UserResponse;
import com.bwevent.user.service.UserService;
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
@RequestMapping("/restaurants/{restaurantId}/users")
@RequiredArgsConstructor
public class StaffController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<List<UserResponse>>> list(@PathVariable @P("restaurantId") UUID restaurantId) {
        return ResponseEntity.ok(ApiResponse.success(userService.listStaff(restaurantId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<UserResponse>> create(@PathVariable @P("restaurantId") UUID restaurantId,
                                                              @Valid @RequestBody CreateStaffRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(userService.createStaff(restaurantId, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<Void> delete(@PathVariable @P("restaurantId") UUID restaurantId,
                                        @PathVariable UUID id,
                                        @AuthenticationPrincipal AuthPrincipal principal) {
        userService.deleteStaff(restaurantId, id, principal.getUserId());
        return ResponseEntity.noContent().build();
    }
}
