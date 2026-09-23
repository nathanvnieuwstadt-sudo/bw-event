package com.bwevent.eventtype.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class EventTypeRequest {

    @NotBlank(message = "Event type name is required")
    private String name;

    private String description;

    @Valid
    private List<EventTypeFieldRequest> fields = new ArrayList<>();
}
