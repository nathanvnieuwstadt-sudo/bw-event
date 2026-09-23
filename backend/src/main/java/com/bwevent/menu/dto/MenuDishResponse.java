package com.bwevent.menu.dto;

import com.bwevent.domain.model.MenuDish;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class MenuDishResponse {

    private UUID id;
    private String dishName;
    private String description;
    private Integer displayOrder;

    public static MenuDishResponse from(MenuDish d) {
        return MenuDishResponse.builder()
                .id(d.getId())
                .dishName(d.getDishName())
                .description(d.getDescription())
                .displayOrder(d.getDisplayOrder())
                .build();
    }
}
