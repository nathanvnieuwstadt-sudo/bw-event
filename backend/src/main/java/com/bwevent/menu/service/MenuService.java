package com.bwevent.menu.service;

import com.bwevent.domain.model.Menu;
import com.bwevent.domain.model.MenuDish;
import com.bwevent.menu.dto.MenuDishRequest;
import com.bwevent.menu.dto.MenuRequest;
import com.bwevent.menu.dto.MenuResponse;
import com.bwevent.menu.repository.MenuRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepository;

    public List<MenuResponse> listByRestaurant(UUID restaurantId) {
        return menuRepository.findAllByRestaurantIdOrderByDisplayOrderAscNameAsc(restaurantId)
                .stream().map(MenuResponse::from).toList();
    }

    public MenuResponse getById(UUID id) {
        return MenuResponse.from(findOrThrow(id));
    }

    @Transactional
    public MenuResponse create(UUID restaurantId, MenuRequest request) {
        int displayOrder = menuRepository.findAllByRestaurantIdOrderByDisplayOrderAscNameAsc(restaurantId).size();
        Menu menu = Menu.builder()
                .restaurantId(restaurantId)
                .name(request.getName())
                .description(request.getDescription())
                .displayOrder(displayOrder)
                .build();
        applyDishes(menu, request);
        return MenuResponse.from(menuRepository.save(menu));
    }

    @Transactional
    public MenuResponse update(UUID id, MenuRequest request) {
        Menu menu = findOrThrow(id);
        menu.setName(request.getName());
        menu.setDescription(request.getDescription());
        menu.getDishes().clear();
        applyDishes(menu, request);
        return MenuResponse.from(menuRepository.save(menu));
    }

    @Transactional
    public void delete(UUID id) {
        menuRepository.delete(findOrThrow(id));
    }

    private void applyDishes(Menu menu, MenuRequest request) {
        if (request.getDishes() == null) return;
        for (int i = 0; i < request.getDishes().size(); i++) {
            MenuDishRequest dr = request.getDishes().get(i);
            menu.getDishes().add(MenuDish.builder()
                    .menu(menu)
                    .dishName(dr.getDishName())
                    .description(dr.getDescription())
                    .displayOrder(dr.getDisplayOrder() != null ? dr.getDisplayOrder() : i)
                    .build());
        }
    }

    private Menu findOrThrow(UUID id) {
        return menuRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Menu not found: " + id));
    }
}
