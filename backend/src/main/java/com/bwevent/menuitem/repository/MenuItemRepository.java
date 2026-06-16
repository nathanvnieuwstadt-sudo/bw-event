package com.bwevent.menuitem.repository;

import com.bwevent.domain.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {
    List<MenuItem> findAllByBanquetId(UUID banquetId);
}
