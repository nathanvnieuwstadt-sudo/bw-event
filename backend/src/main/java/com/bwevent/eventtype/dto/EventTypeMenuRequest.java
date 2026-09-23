package com.bwevent.eventtype.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class EventTypeMenuRequest {

    @NotBlank(message = "Menu name is required")
    private String name;

    private String description;

    private Integer displayOrder = 0;

    @Valid
    private List<EventTypeMenuItemRequest> items = new ArrayList<>();
}
