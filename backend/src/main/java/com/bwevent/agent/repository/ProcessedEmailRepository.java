package com.bwevent.agent.repository;

import com.bwevent.domain.model.ProcessedEmail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProcessedEmailRepository extends JpaRepository<ProcessedEmail, UUID> {
    List<ProcessedEmail> findAllByRestaurantIdOrderByReceivedAtDesc(UUID restaurantId);

    boolean existsByRestaurantIdAndGmailMessageId(UUID restaurantId, String gmailMessageId);
}
