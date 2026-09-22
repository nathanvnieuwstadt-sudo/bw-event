package com.bwevent.banquet.dto;

import com.bwevent.domain.enums.BanquetLocation;
import com.bwevent.domain.enums.BanquetSource;
import com.bwevent.domain.enums.BanquetStatus;
import com.bwevent.domain.model.Banquet;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class BanquetSummary {
    private UUID id;
    private BanquetStatus status;
    private BanquetSource source;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private BanquetLocation location;
    private Integer headcount;
    private String contactName;
    private String contactOrganization;

    public static BanquetSummary from(Banquet b) {
        return BanquetSummary.builder()
                .id(b.getId())
                .status(b.getStatus())
                .source(b.getSource())
                .date(b.getDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .location(b.getLocation())
                .headcount(b.getHeadcount())
                .contactName(b.getContact() != null ? b.getContact().getName() : null)
                .contactOrganization(b.getContact() != null ? b.getContact().getOrganization() : null)
                .build();
    }
}
