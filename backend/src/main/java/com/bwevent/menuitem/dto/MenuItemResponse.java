package com.bwevent.menuitem.dto;

import com.bwevent.domain.model.MenuItem;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class MenuItemResponse {
    private UUID id;
    private String dishName;
    private Integer quantity;
    private String notes;

    public static MenuItemResponse from(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .dishName(item.getDishName())
                .quantity(item.getQuantity())
                .notes(item.getNotes())
                .build();
    }
}
