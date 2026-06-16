package com.bwevent.contact.repository;

import com.bwevent.domain.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ContactRepository extends JpaRepository<Contact, UUID> {
    List<Contact> findAllByRestaurantIdOrderByNameAsc(UUID restaurantId);
}
