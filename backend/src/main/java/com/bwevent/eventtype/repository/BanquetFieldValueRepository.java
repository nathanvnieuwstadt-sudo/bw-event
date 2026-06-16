package com.bwevent.eventtype.repository;

import com.bwevent.domain.model.BanquetFieldValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BanquetFieldValueRepository extends JpaRepository<BanquetFieldValue, UUID> {
    List<BanquetFieldValue> findAllByBanquetId(UUID banquetId);
    void deleteAllByBanquetId(UUID banquetId);
}
