package com.fieldforce.controller;

import com.fieldforce.dto.ProfileUpdateRequest;
import com.fieldforce.dto.UserProfileResponse;
import com.fieldforce.entity.User;
import com.fieldforce.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmailWithSupervisor(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        return ResponseEntity.ok(UserProfileResponse.from(user));
    }

    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getBloodGroup() != null) {
            user.setBloodGroup(request.getBloodGroup().trim());
        }
        userRepository.save(user);

        User fresh = userRepository.findByEmailWithSupervisor(user.getEmail()).orElse(user);
        return ResponseEntity.ok(UserProfileResponse.from(fresh));
    }

    @PutMapping("/department")
    public ResponseEntity<?> updateDepartment(@RequestBody Map<String, String> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();

        User user = userRepository.findByEmail(currentPrincipalName).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Error: User not found");
        }

        String newDepartment = request.get("department");
        if (newDepartment == null || newDepartment.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Department cannot be empty");
        }

        if (user.getDepartment() != null && !user.getDepartment().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Department is already set and cannot be changed");
        }

        user.setDepartment(newDepartment);
        userRepository.save(user);

        return ResponseEntity.ok("Department updated successfully");
    }

    @GetMapping("/workers")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getWorkersForSupervisor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User supervisor = userRepository.findByEmail(email).orElse(null);
        if (supervisor == null) {
            return ResponseEntity.badRequest().body("Error: Supervisor not found");
        }

        if (supervisor.getRole() != User.Role.SUPERVISOR) {
            return ResponseEntity.status(403).body("Error: Only supervisors can access this resource");
        }

        java.util.List<UserProfileResponse> workers = userRepository.findBySupervisor_UserId(supervisor.getUserId())
                .stream()
                .map(UserProfileResponse::from)
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(workers);
    }
}
