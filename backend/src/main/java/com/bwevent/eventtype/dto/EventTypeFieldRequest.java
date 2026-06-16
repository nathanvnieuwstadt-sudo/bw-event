package com.bwevent.eventtype.dto;

import com.bwevent.domain.enums.FieldType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EventTypeFieldRequest {

    @NotBlank(message = "Field label is required")
    private String fieldLabel;

    private FieldType fieldType = FieldType.TEXT;

    /** Comma-separated options for SELECT fields */
    private String options;

    private Boolean required = false;

    private Integer displayOrder = 0;
}
