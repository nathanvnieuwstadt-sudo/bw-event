package com.bwevent.eventtype.controller;

import com.bwevent.config.ApiResponse;
import com.bwevent.eventtype.dto.EventTypeRequest;
import com.bwevent.eventtype.dto.EventTypeResponse;
import com.bwevent.eventtype.service.EventTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/restaurants/{restaurantId}/event-types")
@RequiredArgsConstructor
public class EventTypeController {

    private final EventTypeService eventTypeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DEV', 'OWNER', 'GENERAL_MANAGER', 'FLOOR_MANAGER')")
    public ResponseEntity<ApiResponse<List<EventTypeResponse>>> list(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(ApiResponse.success(eventTypeService.listByRestaurant(restaurantId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'OWNER', 'GENERAL_MANAGER', 'FLOOR_MANAGER')")
    public ResponseEntity<ApiResponse<EventTypeResponse>> getById(
            @PathVariable UUID restaurantId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(eventTypeService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER')")
    public ResponseEntity<ApiResponse<EventTypeResponse>> create(
            @PathVariable UUID restaurantId,
            @Valid @RequestBody EventTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(eventTypeService.create(restaurantId, request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER')")
    public ResponseEntity<ApiResponse<EventTypeResponse>> update(
            @PathVariable UUID restaurantId,
            @PathVariable UUID id,
            @Valid @RequestBody EventTypeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(eventTypeService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER')")
    public ResponseEntity<Void> delete(
            @PathVariable UUID restaurantId,
            @PathVariable UUID id) {
        eventTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
