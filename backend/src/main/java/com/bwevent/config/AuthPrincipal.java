package com.bwevent.config;

import com.bwevent.domain.enums.UserRole;
import lombok.Value;

import java.util.UUID;

/**
 * The Spring Security principal attached by JwtAuthFilter — carries the JWT's
 * userId/restaurantId/role claims together so @tenantGuard (TenantGuard) can
 * check a path's restaurantId against the token without a second lookup.
 */
@Value
public class AuthPrincipal {
    UUID userId;
    UUID restaurantId;
    UserRole role;
}
