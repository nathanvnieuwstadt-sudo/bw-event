package com.bwevent.menu.repository;

import com.bwevent.domain.model.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MenuRepository extends JpaRepository<Menu, UUID> {
    List<Menu> findAllByRestaurantIdOrderByDisplayOrderAscNameAsc(UUID restaurantId);
}
