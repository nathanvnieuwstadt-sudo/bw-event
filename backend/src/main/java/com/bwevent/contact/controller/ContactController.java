package com.bwevent.contact.controller;

import com.bwevent.config.ApiResponse;
import com.bwevent.contact.dto.ContactRequest;
import com.bwevent.contact.dto.ContactResponse;
import com.bwevent.contact.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/restaurants/{restaurantId}/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DEV', 'OWNER', 'GENERAL_MANAGER', 'FLOOR_MANAGER')")
    public ResponseEntity<ApiResponse<List<ContactResponse>>> list(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(ApiResponse.success(contactService.listByRestaurant(restaurantId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'OWNER', 'GENERAL_MANAGER', 'FLOOR_MANAGER')")
    public ResponseEntity<ApiResponse<ContactResponse>> getById(@PathVariable UUID restaurantId,
                                                                 @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(contactService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER', 'FLOOR_MANAGER')")
    public ResponseEntity<ApiResponse<ContactResponse>> create(@PathVariable UUID restaurantId,
                                                                @Valid @RequestBody ContactRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(contactService.create(restaurantId, request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER', 'FLOOR_MANAGER')")
    public ResponseEntity<ApiResponse<ContactResponse>> update(@PathVariable UUID restaurantId,
                                                                @PathVariable UUID id,
                                                                @Valid @RequestBody ContactRequest request) {
        return ResponseEntity.ok(ApiResponse.success(contactService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable UUID restaurantId, @PathVariable UUID id) {
        contactService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
