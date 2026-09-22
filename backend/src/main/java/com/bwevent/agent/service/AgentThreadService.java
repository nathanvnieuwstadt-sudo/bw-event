package com.bwevent.agent.service;

import com.bwevent.agent.dto.AgentDraftResponse;
import com.bwevent.agent.dto.SimulateEmailRequest;
import com.bwevent.agent.repository.EmailThreadRepository;
import com.bwevent.contact.repository.ContactRepository;
import com.bwevent.domain.model.Contact;
import com.bwevent.domain.model.EmailThread;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Simulates an inbound email (no live Gmail integration yet for this path —
 * see CLAUDE.md; real ingestion lives in GmailPollingService). Creates the
 * thread and drafts a reply via the real Claude API when configured, falling
 * back to the mock generator otherwise, exercising the same approve/reject
 * pipeline a real Gmail-sourced thread would use.
 */
@Service
@RequiredArgsConstructor
public class AgentThreadService {

    private final EmailThreadRepository emailThreadRepository;
    private final ContactRepository contactRepository;
    private final DraftGenerationService draftGenerationService;
    private final DraftCreationService draftCreationService;

    @Transactional
    public AgentDraftResponse simulateIncomingEmail(UUID restaurantId, SimulateEmailRequest request) {
        Contact contact = null;
        if (request.getContactId() != null) {
            contact = contactRepository.findById(request.getContactId())
                    .filter(c -> c.getRestaurantId().equals(restaurantId))
                    .orElseThrow(() -> new EntityNotFoundException("Contact not found: " + request.getContactId()));
        } else if (request.getSenderName() == null || request.getSenderName().isBlank()) {
            throw new IllegalArgumentException("Either contactId or senderName is required");
        }

        EmailThread thread = EmailThread.builder()
                .restaurantId(restaurantId)
                .contact(contact)
                .senderName(contact == null ? request.getSenderName() : null)
                .senderEmail(request.getSenderEmail())
                .subject(request.getSubject())
                .lastMessageAt(Instant.now())
                .lastMessageBody(request.getMessageBody())
                .build();
        thread = emailThreadRepository.save(thread);

        String contactName = contact != null ? contact.getName() : request.getSenderName();
        DraftGenerationService.Result result = draftGenerationService.generate(
                restaurantId, contactName, request.getSubject(), request.getMessageBody());

        return draftCreationService.createDraft(restaurantId, thread, result.draftBody(), result.meta());
    }
}
