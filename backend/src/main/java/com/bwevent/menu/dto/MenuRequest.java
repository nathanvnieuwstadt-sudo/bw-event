package com.bwevent.menu.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class MenuRequest {

    @NotBlank(message = "Menu name is required")
    private String name;

    private String description;

    @Valid
    private List<MenuDishRequest> dishes = new ArrayList<>();
}
