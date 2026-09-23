package com.bwevent.eventtype.dto;

import com.bwevent.domain.model.EventTypeMenuItem;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class EventTypeMenuItemResponse {

    private UUID id;
    private String dishName;
    private String description;
    private Integer displayOrder;

    public static EventTypeMenuItemResponse from(EventTypeMenuItem i) {
        return EventTypeMenuItemResponse.builder()
                .id(i.getId())
                .dishName(i.getDishName())
                .description(i.getDescription())
                .displayOrder(i.getDisplayOrder())
                .build();
    }
}
