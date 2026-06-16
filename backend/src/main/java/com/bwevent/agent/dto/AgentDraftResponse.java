package com.bwevent.agent.dto;

import com.bwevent.domain.enums.DraftStatus;
import com.bwevent.domain.model.AgentDraft;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class AgentDraftResponse {
    private UUID id;
    private UUID restaurantId;
    private UUID emailThreadId;
    private String emailSubject;
    private String emailSenderMessage;
    private Instant emailLastMessageAt;
    private UUID banquetId;
    private String contactName;
    private String draftBody;
    private DraftStatus status;
    private Instant createdAt;
    private UUID reviewedBy;
    private Instant reviewedAt;

    public static AgentDraftResponse from(AgentDraft d) {
        String contactName = null;
        if (d.getBanquet() != null && d.getBanquet().getContact() != null) {
            contactName = d.getBanquet().getContact().getName();
        }
        return AgentDraftResponse.builder()
                .id(d.getId())
                .restaurantId(d.getRestaurantId())
                .emailThreadId(d.getEmailThread() != null ? d.getEmailThread().getId() : null)
                .emailSubject(d.getEmailThread() != null ? d.getEmailThread().getSubject() : null)
                .emailSenderMessage(d.getEmailThread() != null ? d.getEmailThread().getLastMessageBody() : null)
                .emailLastMessageAt(d.getEmailThread() != null ? d.getEmailThread().getLastMessageAt() : null)
                .banquetId(d.getBanquet() != null ? d.getBanquet().getId() : null)
                .contactName(contactName)
                .draftBody(d.getDraftBody())
                .status(d.getStatus())
                .createdAt(d.getCreatedAt())
                .reviewedBy(d.getReviewedBy())
                .reviewedAt(d.getReviewedAt())
                .build();
    }
}
