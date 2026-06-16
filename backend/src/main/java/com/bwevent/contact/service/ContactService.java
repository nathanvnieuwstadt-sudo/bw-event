package com.bwevent.contact.service;

import com.bwevent.contact.dto.ContactRequest;
import com.bwevent.contact.dto.ContactResponse;
import com.bwevent.contact.repository.ContactRepository;
import com.bwevent.domain.model.Contact;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;

    public List<ContactResponse> listByRestaurant(UUID restaurantId) {
        return contactRepository.findAllByRestaurantIdOrderByNameAsc(restaurantId)
                .stream().map(ContactResponse::from).toList();
    }

    public ContactResponse getById(UUID id) {
        return ContactResponse.from(findOrThrow(id));
    }

    @Transactional
    public ContactResponse create(UUID restaurantId, ContactRequest request) {
        Contact contact = Contact.builder()
                .restaurantId(restaurantId)
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .organization(request.getOrganization())
                .build();
        return ContactResponse.from(contactRepository.save(contact));
    }

    @Transactional
    public ContactResponse update(UUID id, ContactRequest request) {
        Contact contact = findOrThrow(id);
        contact.setName(request.getName());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setOrganization(request.getOrganization());
        return ContactResponse.from(contactRepository.save(contact));
    }

    @Transactional
    public void delete(UUID id) {
        contactRepository.delete(findOrThrow(id));
    }

    private Contact findOrThrow(UUID id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contact not found: " + id));
    }
}
