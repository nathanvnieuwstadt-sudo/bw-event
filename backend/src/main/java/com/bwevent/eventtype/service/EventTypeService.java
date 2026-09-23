package com.bwevent.eventtype.service;

import com.bwevent.domain.model.EventType;
import com.bwevent.domain.model.EventTypeField;
import com.bwevent.eventtype.dto.EventTypeFieldRequest;
import com.bwevent.eventtype.dto.EventTypeRequest;
import com.bwevent.eventtype.dto.EventTypeResponse;
import com.bwevent.eventtype.repository.EventTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventTypeService {

    private final EventTypeRepository eventTypeRepository;

    public List<EventTypeResponse> listByRestaurant(UUID restaurantId) {
        return eventTypeRepository.findAllByRestaurantIdOrderByNameAsc(restaurantId)
                .stream().map(EventTypeResponse::from).toList();
    }

    public EventTypeResponse getById(UUID id) {
        return EventTypeResponse.from(findOrThrow(id));
    }

    @Transactional
    public EventTypeResponse create(UUID restaurantId, EventTypeRequest request) {
        EventType eventType = EventType.builder()
                .restaurantId(restaurantId)
                .name(request.getName())
                .description(request.getDescription())
                .build();
        applyFields(eventType, request);
        return EventTypeResponse.from(eventTypeRepository.save(eventType));
    }

    @Transactional
    public EventTypeResponse update(UUID id, EventTypeRequest request) {
        EventType eventType = findOrThrow(id);
        eventType.setName(request.getName());
        eventType.setDescription(request.getDescription());
        eventType.getFields().clear();
        applyFields(eventType, request);
        return EventTypeResponse.from(eventTypeRepository.save(eventType));
    }

    @Transactional
    public void delete(UUID id) {
        eventTypeRepository.delete(findOrThrow(id));
    }

    private void applyFields(EventType eventType, EventTypeRequest request) {
        if (request.getFields() == null) return;
        for (int i = 0; i < request.getFields().size(); i++) {
            EventTypeFieldRequest fr = request.getFields().get(i);
            EventTypeField field = EventTypeField.builder()
                    .eventType(eventType)
                    .fieldKey(toKey(fr.getFieldLabel()))
                    .fieldLabel(fr.getFieldLabel())
                    .fieldType(fr.getFieldType() != null ? fr.getFieldType() : com.bwevent.domain.enums.FieldType.TEXT)
                    .options(fr.getOptions())
                    .required(fr.getRequired() != null ? fr.getRequired() : false)
                    .displayOrder(fr.getDisplayOrder() != null ? fr.getDisplayOrder() : i)
                    .build();
            eventType.getFields().add(field);
        }
    }

    /** Converts a human label to a snake_case key, e.g. "Dress Code" → "dress_code" */
    private String toKey(String label) {
        String normalized = Normalizer.normalize(label, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return normalized.trim().toLowerCase()
                .replaceAll("[^a-z0-9]+", "_")
                .replaceAll("^_+|_+$", "");
    }

    private EventType findOrThrow(UUID id) {
        return eventTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("EventType not found: " + id));
    }
}
