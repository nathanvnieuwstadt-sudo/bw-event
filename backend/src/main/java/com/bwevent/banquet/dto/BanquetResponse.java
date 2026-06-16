package com.bwevent.banquet.dto;

import com.bwevent.contact.dto.ContactResponse;
import com.bwevent.domain.enums.BanquetSource;
import com.bwevent.domain.enums.BanquetStatus;
import com.bwevent.domain.model.Banquet;
import com.bwevent.eventtype.dto.EventTypeResponse;
import com.bwevent.menuitem.dto.MenuItemResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class BanquetResponse {
    private UUID id;
    private UUID restaurantId;
    private ContactResponse contact;
    private BanquetStatus status;
    private BanquetSource source;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer headcount;
    private BigDecimal budget;
    private String roomSetup;
    private String dietaryRestrictions;
    private String avNeeds;
    private Boolean depositPaid;
    private BigDecimal depositAmount;
    private String notes;
    private UUID createdBy;
    private List<MenuItemResponse> menuItems;
    private EventTypeResponse eventType;
    /** fieldId (string) → value */
    private Map<String, String> fieldValues;
    private Instant createdAt;
    private Instant updatedAt;

    public static BanquetResponse from(Banquet b) {
        return BanquetResponse.builder()
                .id(b.getId())
                .restaurantId(b.getRestaurantId())
                .contact(b.getContact() != null ? ContactResponse.from(b.getContact()) : null)
                .status(b.getStatus())
                .source(b.getSource())
                .date(b.getDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .headcount(b.getHeadcount())
                .budget(b.getBudget())
                .roomSetup(b.getRoomSetup())
                .dietaryRestrictions(b.getDietaryRestrictions())
                .avNeeds(b.getAvNeeds())
                .depositPaid(b.getDepositPaid())
                .depositAmount(b.getDepositAmount())
                .notes(b.getNotes())
                .createdBy(b.getCreatedBy())
                .menuItems(b.getMenuItems().stream().map(MenuItemResponse::from).toList())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
