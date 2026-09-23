package com.bwevent.menu.dto;

import com.bwevent.domain.model.Menu;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class MenuResponse {

    private UUID id;
    private UUID restaurantId;
    private String name;
    private String description;
    private Integer displayOrder;
    private List<MenuDishResponse> dishes;
    private Instant createdAt;

    public static MenuResponse from(Menu m) {
        return MenuResponse.builder()
                .id(m.getId())
                .restaurantId(m.getRestaurantId())
                .name(m.getName())
                .description(m.getDescription())
                .displayOrder(m.getDisplayOrder())
                .dishes(m.getDishes().stream().map(MenuDishResponse::from).toList())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
