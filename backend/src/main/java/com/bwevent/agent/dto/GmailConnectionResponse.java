package com.bwevent.agent.dto;

import com.bwevent.domain.model.GmailConnection;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class GmailConnectionResponse {
    private boolean connected;
    private String gmailEmail;
    private Instant lastPollAt;
    private String lastPollStatus;
    private String lastError;

    public static GmailConnectionResponse disconnected() {
        return GmailConnectionResponse.builder().connected(false).build();
    }

    public static GmailConnectionResponse from(GmailConnection c) {
        return GmailConnectionResponse.builder()
                .connected(true)
                .gmailEmail(c.getGmailEmail())
                .lastPollAt(c.getLastPollAt())
                .lastPollStatus(c.getLastPollStatus())
                .lastError(c.getLastError())
                .build();
    }
}
