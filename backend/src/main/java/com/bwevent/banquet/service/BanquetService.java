package com.bwevent.banquet.service;

import com.bwevent.banquet.dto.BanquetRequest;
import com.bwevent.banquet.dto.BanquetResponse;
import com.bwevent.banquet.dto.BanquetSummary;
import com.bwevent.banquet.repository.BanquetRepository;
import com.bwevent.contact.repository.ContactRepository;
import com.bwevent.domain.enums.BanquetSource;
import com.bwevent.domain.enums.BanquetStatus;
import com.bwevent.domain.model.Banquet;
import com.bwevent.domain.model.BanquetFieldValue;
import com.bwevent.domain.model.MenuItem;
import com.bwevent.eventtype.dto.EventTypeResponse;
import com.bwevent.eventtype.repository.BanquetFieldValueRepository;
import com.bwevent.eventtype.repository.EventTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BanquetService {

    private final BanquetRepository banquetRepository;
    private final ContactRepository contactRepository;
    private final EventTypeRepository eventTypeRepository;
    private final BanquetFieldValueRepository fieldValueRepository;

    public List<BanquetSummary> listByRestaurant(UUID restaurantId) {
        return banquetRepository.findAllByRestaurantIdOrderByDateAscStartTimeAsc(restaurantId)
                .stream().map(BanquetSummary::from).toList();
    }

    public List<BanquetSummary> listUpcoming(UUID restaurantId, int daysAhead) {
        LocalDate from = LocalDate.now();
        LocalDate to = from.plusDays(daysAhead);
        return banquetRepository.findUpcoming(restaurantId, from, to)
                .stream().map(BanquetSummary::from).toList();
    }

    public BanquetResponse getById(UUID id) {
        Banquet banquet = findOrThrow(id);
        return buildResponse(banquet);
    }

    @Transactional
    public BanquetResponse create(UUID restaurantId, UUID createdBy, BanquetRequest request) {
        Banquet banquet = Banquet.builder()
                .restaurantId(restaurantId)
                .createdBy(createdBy)
                .status(request.getStatus() != null ? request.getStatus() : BanquetStatus.DRAFT)
                .source(request.getSource() != null ? request.getSource() : BanquetSource.MANUAL)
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .headcount(request.getHeadcount())
                .budget(request.getBudget())
                .roomSetup(request.getRoomSetup())
                .dietaryRestrictions(request.getDietaryRestrictions())
                .avNeeds(request.getAvNeeds())
                .depositPaid(request.getDepositPaid() != null ? request.getDepositPaid() : false)
                .depositAmount(request.getDepositAmount())
                .notes(request.getNotes())
                .eventTypeId(request.getEventTypeId())
                .build();

        if (request.getContactId() != null) {
            banquet.setContact(contactRepository.findById(request.getContactId())
                    .orElseThrow(() -> new EntityNotFoundException("Contact not found: " + request.getContactId())));
        }

        applyMenuItems(banquet, request, restaurantId);
        validateConfirmedStatus(banquet);

        Banquet saved = banquetRepository.save(banquet);
        saveFieldValues(saved.getId(), request.getFieldValues());
        return buildResponse(saved);
    }

    @Transactional
    public BanquetResponse update(UUID id, UUID restaurantId, BanquetRequest request) {
        Banquet banquet = findOrThrow(id);

        banquet.setDate(request.getDate());
        banquet.setStartTime(request.getStartTime());
        banquet.setEndTime(request.getEndTime());
        banquet.setHeadcount(request.getHeadcount());
        banquet.setBudget(request.getBudget());
        banquet.setRoomSetup(request.getRoomSetup());
        banquet.setDietaryRestrictions(request.getDietaryRestrictions());
        banquet.setAvNeeds(request.getAvNeeds());
        banquet.setDepositPaid(request.getDepositPaid() != null ? request.getDepositPaid() : banquet.getDepositPaid());
        banquet.setDepositAmount(request.getDepositAmount());
        banquet.setNotes(request.getNotes());
        banquet.setEventTypeId(request.getEventTypeId());

        if (request.getStatus() != null) {
            banquet.setStatus(request.getStatus());
        }
        if (request.getContactId() != null) {
            banquet.setContact(contactRepository.findById(request.getContactId())
                    .orElseThrow(() -> new EntityNotFoundException("Contact not found: " + request.getContactId())));
        }

        banquet.getMenuItems().clear();
        applyMenuItems(banquet, request, restaurantId);
        validateConfirmedStatus(banquet);

        Banquet saved = banquetRepository.save(banquet);
        fieldValueRepository.deleteAllByBanquetId(saved.getId());
        saveFieldValues(saved.getId(), request.getFieldValues());
        return buildResponse(saved);
    }

    @Transactional
    public void delete(UUID id) {
        banquetRepository.delete(findOrThrow(id));
    }

    private BanquetResponse buildResponse(Banquet banquet) {
        BanquetResponse response = BanquetResponse.from(banquet);

        if (banquet.getEventTypeId() != null) {
            eventTypeRepository.findById(banquet.getEventTypeId())
                    .ifPresent(et -> response.setEventType(EventTypeResponse.from(et)));
        }

        Map<String, String> fv = fieldValueRepository.findAllByBanquetId(banquet.getId())
                .stream()
                .collect(Collectors.toMap(
                        v -> v.getFieldId().toString(),
                        v -> v.getValue() != null ? v.getValue() : ""
                ));
        response.setFieldValues(fv);

        return response;
    }

    private void saveFieldValues(UUID banquetId, Map<UUID, String> fieldValues) {
        if (fieldValues == null || fieldValues.isEmpty()) return;
        List<BanquetFieldValue> values = fieldValues.entrySet().stream()
                .filter(e -> e.getValue() != null && !e.getValue().isBlank())
                .map(e -> BanquetFieldValue.builder()
                        .banquetId(banquetId)
                        .fieldId(e.getKey())
                        .value(e.getValue())
                        .build())
                .toList();
        fieldValueRepository.saveAll(values);
    }

    private void validateConfirmedStatus(Banquet banquet) {
        if (banquet.getStatus() == BanquetStatus.CONFIRMED) {
            if (banquet.getDate() == null || banquet.getStartTime() == null
                    || banquet.getEndTime() == null || banquet.getHeadcount() == null
                    || banquet.getContact() == null) {
                throw new IllegalArgumentException(
                        "Cannot confirm banquet: date, start time, end time, headcount, and contact are required");
            }
        }
    }

    private void applyMenuItems(Banquet banquet, BanquetRequest request, UUID restaurantId) {
        if (request.getMenuItems() != null) {
            request.getMenuItems().forEach(itemReq -> {
                MenuItem item = MenuItem.builder()
                        .restaurantId(restaurantId)
                        .banquet(banquet)
                        .dishName(itemReq.getDishName())
                        .quantity(itemReq.getQuantity())
                        .notes(itemReq.getNotes())
                        .build();
                banquet.getMenuItems().add(item);
            });
        }
    }

    private Banquet findOrThrow(UUID id) {
        return banquetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Banquet not found: " + id));
    }
}
