package com.bwevent.config;

import com.bwevent.domain.enums.UserRole;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Backs the "@tenantGuard.check(#restaurantId)" SpEL expression added to every
 * @PreAuthorize on a /restaurants/{restaurantId}/** endpoint. Previously
 * restaurantId was trusted straight from the URL path with nothing checking it
 * against the caller's JWT — any authenticated user could read or write another
 * restaurant's data by changing the path. DEV is exempt: it's the cross-restaurant
 * vendor/maintenance role by design.
 */
@Component("tenantGuard")
public class TenantGuard {

    public boolean check(UUID restaurantId) {
        AuthPrincipal principal = (AuthPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getRole() == UserRole.DEV || restaurantId.equals(principal.getRestaurantId());
    }
}
