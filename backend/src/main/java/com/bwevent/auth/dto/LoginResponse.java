package com.bwevent.auth.dto;

import com.bwevent.domain.enums.UserRole;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class LoginResponse {
    private String token;
    private UUID userId;
    private String email;
    private UserRole role;
    private UUID restaurantId;
}
