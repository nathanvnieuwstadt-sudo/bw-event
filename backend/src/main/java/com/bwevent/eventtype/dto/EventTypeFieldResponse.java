package com.bwevent.eventtype.dto;

import com.bwevent.domain.enums.FieldType;
import com.bwevent.domain.model.EventTypeField;
import lombok.Builder;
import lombok.Data;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class EventTypeFieldResponse {

    private UUID id;
    private String fieldKey;
    private String fieldLabel;
    private FieldType fieldType;
    private List<String> options;
    private Boolean required;
    private Integer displayOrder;

    public static EventTypeFieldResponse from(EventTypeField f) {
        List<String> opts = Collections.emptyList();
        if (f.getOptions() != null && !f.getOptions().isBlank()) {
            opts = Arrays.stream(f.getOptions().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
        return EventTypeFieldResponse.builder()
                .id(f.getId())
                .fieldKey(f.getFieldKey())
                .fieldLabel(f.getFieldLabel())
                .fieldType(f.getFieldType())
                .options(opts)
                .required(f.getRequired())
                .displayOrder(f.getDisplayOrder())
                .build();
    }
}
