package com.bwevent.restaurant.service;

import com.bwevent.domain.model.Restaurant;
import com.bwevent.restaurant.dto.RestaurantResponse;
import com.bwevent.restaurant.repository.RestaurantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public RestaurantResponse getById(UUID id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Restaurant not found: " + id));
        return RestaurantResponse.from(restaurant);
    }
}
