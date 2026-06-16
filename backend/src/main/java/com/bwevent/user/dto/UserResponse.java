package com.bwevent.user.dto;

import com.bwevent.domain.enums.UserRole;
import com.bwevent.domain.model.User;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private UUID restaurantId;
    private String email;
    private UserRole role;
    private Instant createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .restaurantId(user.getRestaurantId())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
