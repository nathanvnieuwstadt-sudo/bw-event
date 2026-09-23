package com.bwevent.menu.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MenuDishRequest {

    @NotBlank(message = "Dish name is required")
    private String dishName;

    private String description;

    private Integer displayOrder = 0;
}
