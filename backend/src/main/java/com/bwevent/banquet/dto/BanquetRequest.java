package com.bwevent.banquet.dto;

import com.bwevent.domain.enums.BanquetSource;
import com.bwevent.domain.enums.BanquetStatus;
import com.bwevent.menuitem.dto.MenuItemRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class BanquetRequest {
    private UUID contactId;
    private BanquetStatus status;
    private BanquetSource source;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    @Min(value = 1, message = "Headcount must be at least 1")
    private Integer headcount;

    private BigDecimal budget;
    private String roomSetup;
    private String dietaryRestrictions;
    private String avNeeds;
    private Boolean depositPaid;
    private BigDecimal depositAmount;
    private String notes;

    private UUID eventTypeId;

    /** fieldId (UUID) → value */
    private Map<UUID, String> fieldValues = new HashMap<>();

    @Valid
    private List<MenuItemRequest> menuItems = new ArrayList<>();
}
