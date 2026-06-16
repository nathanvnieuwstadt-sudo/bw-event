package com.bwevent.eventtype.repository;

import com.bwevent.domain.model.EventType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EventTypeRepository extends JpaRepository<EventType, UUID> {
    List<EventType> findAllByRestaurantIdOrderByNameAsc(UUID restaurantId);
}
