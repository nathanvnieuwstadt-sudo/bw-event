package com.bwevent.eventtype.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EventTypeMenuItemRequest {

    @NotBlank(message = "Dish name is required")
    private String dishName;

    private String description;

    private Integer displayOrder = 0;
}
