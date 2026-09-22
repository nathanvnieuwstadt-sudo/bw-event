package com.bwevent.agent.repository;

import com.bwevent.domain.model.GmailConnection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GmailConnectionRepository extends JpaRepository<GmailConnection, UUID> {
    Optional<GmailConnection> findByRestaurantId(UUID restaurantId);
}
