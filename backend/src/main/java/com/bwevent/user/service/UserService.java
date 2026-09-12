package com.bwevent.user.service;

import com.bwevent.domain.enums.UserRole;
import com.bwevent.domain.model.User;
import com.bwevent.user.dto.CreateStaffRequest;
import com.bwevent.user.dto.UserResponse;
import com.bwevent.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
        return UserResponse.from(user);
    }

    public UserResponse getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));
        return UserResponse.from(user);
    }

    public List<UserResponse> listStaff(UUID restaurantId) {
        return userRepository.findAllByRestaurantIdOrderByEmailAsc(restaurantId)
                .stream().map(UserResponse::from).toList();
    }

    // DEV is deliberately not assignable here — it's the vendor/maintenance
    // role, not something restaurant staff should be able to grant.
    @Transactional
    public UserResponse createStaff(UUID restaurantId, CreateStaffRequest request) {
        if (request.getRole() == UserRole.DEV) {
            throw new IllegalArgumentException("DEV is not an assignable role");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }
        User user = User.builder()
                .restaurantId(restaurantId)
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void deleteStaff(UUID restaurantId, UUID id, UUID currentUserId) {
        if (id.equals(currentUserId)) {
            throw new IllegalArgumentException("You cannot remove your own account");
        }
        User user = userRepository.findById(id)
                .filter(u -> restaurantId.equals(u.getRestaurantId()))
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
        userRepository.delete(user);
    }
}
