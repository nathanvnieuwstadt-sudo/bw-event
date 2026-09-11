package com.bwevent.agent.service;

import com.bwevent.agent.dto.AgentDraftResponse;
import com.bwevent.agent.dto.SimulateEmailRequest;
import com.bwevent.agent.repository.AgentInstructionRepository;
import com.bwevent.agent.repository.EmailThreadRepository;
import com.bwevent.contact.repository.ContactRepository;
import com.bwevent.domain.model.AgentInstruction;
import com.bwevent.domain.model.Contact;
import com.bwevent.domain.model.EmailThread;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Simulates an inbound email (no live Gmail integration yet — see CLAUDE.md).
 * Creates the thread and immediately runs the mock draft generator so the
 * agent inbox has something to review, exercising the same approve/reject
 * pipeline a real Gmail-sourced thread would use.
 */
@Service
@RequiredArgsConstructor
public class AgentThreadService {

    private final EmailThreadRepository emailThreadRepository;
    private final ContactRepository contactRepository;
    private final AgentInstructionRepository agentInstructionRepository;
    private final MockDraftGenerator mockDraftGenerator;
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

        List<AgentInstruction> enabledInstructions = agentInstructionRepository
                .findAllByRestaurantIdOrderByDisplayOrderAscCreatedAtAsc(restaurantId)
                .stream().filter(AgentInstruction::isEnabled).toList();

        String contactName = contact != null ? contact.getName() : request.getSenderName();
        String draftBody = mockDraftGenerator.generateDraft(
                contactName, request.getSubject(), request.getMessageBody(), enabledInstructions);

        return draftCreationService.createDraft(restaurantId, thread, draftBody);
    }
}
