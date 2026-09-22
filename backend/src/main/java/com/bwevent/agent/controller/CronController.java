package com.bwevent.agent.controller;

import com.bwevent.agent.service.GmailPollingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints meant to be triggered by Google Cloud Scheduler rather than a
 * signed-in user — see SecurityConfig, where /cron/** is permitted through
 * Spring Security so it can be reached without a JWT. Authorization instead
 * comes from a shared secret header, mirroring backend-vercel's /cron/keepalive.
 */
@RestController
@RequiredArgsConstructor
public class CronController {

    private final GmailPollingService gmailPollingService;

    @Value("${app.cron.secret:}")
    private String cronSecret;

    @GetMapping("/cron/agent-poll")
    public ResponseEntity<String> pollGmail(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        gmailPollingService.pollAllConnectedRestaurants();
        return ResponseEntity.ok("OK");
    }

    private boolean isAuthorized(String authHeader) {
        if (cronSecret == null || cronSecret.isBlank()) return true; // no secret configured — local dev
        return authHeader != null && authHeader.equals("Bearer " + cronSecret);
    }
}
