package com.bwevent.eventtype.dto;

import com.bwevent.domain.model.EventTypeMenu;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class EventTypeMenuResponse {

    private UUID id;
    private String name;
    private String description;
    private Integer displayOrder;
    private List<EventTypeMenuItemResponse> items;

    public static EventTypeMenuResponse from(EventTypeMenu m) {
        return EventTypeMenuResponse.builder()
                .id(m.getId())
                .name(m.getName())
                .description(m.getDescription())
                .displayOrder(m.getDisplayOrder())
                .items(m.getItems().stream().map(EventTypeMenuItemResponse::from).toList())
                .build();
    }
}
