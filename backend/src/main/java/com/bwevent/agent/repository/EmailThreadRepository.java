package com.bwevent.agent.repository;

import com.bwevent.domain.model.EmailThread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EmailThreadRepository extends JpaRepository<EmailThread, UUID> {
    List<EmailThread> findAllByRestaurantIdOrderByLastMessageAtDesc(UUID restaurantId);
}
