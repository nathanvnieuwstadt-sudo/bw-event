package com.bwevent.knowledgebase.dto;

import com.bwevent.domain.enums.KnowledgeBaseCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class KnowledgeBaseEntryRequest {

    @NotNull(message = "Category is required")
    private KnowledgeBaseCategory category;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    /** Optional raw JSON — a price, a date — for programmatic rule checks. */
    private String structuredValue;
}
