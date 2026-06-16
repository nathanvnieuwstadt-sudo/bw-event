package com.bwevent.user.controller;

import com.bwevent.config.ApiResponse;
import com.bwevent.user.dto.UserResponse;
import com.bwevent.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(userService.getById(userId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('DEV')")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getById(id)));
    }
}
