package com.bwevent.banquet.repository;

import com.bwevent.domain.enums.BanquetStatus;
import com.bwevent.domain.model.Banquet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface BanquetRepository extends JpaRepository<Banquet, UUID> {

    List<Banquet> findAllByRestaurantIdOrderByDateAscStartTimeAsc(UUID restaurantId);

    List<Banquet> findAllByRestaurantIdAndStatusOrderByDateAscStartTimeAsc(UUID restaurantId, BanquetStatus status);

    @Query("SELECT b FROM Banquet b WHERE b.restaurantId = :restaurantId AND b.date >= :from AND b.date <= :to ORDER BY b.date ASC, b.startTime ASC")
    List<Banquet> findUpcoming(@Param("restaurantId") UUID restaurantId,
                               @Param("from") LocalDate from,
                               @Param("to") LocalDate to);
}
