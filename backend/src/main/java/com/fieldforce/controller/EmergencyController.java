package com.fieldforce.controller;

import com.fieldforce.dto.EmergencyRequest;
import com.fieldforce.dto.EmergencyResponse;
import com.fieldforce.entity.EmergencyIncident;
import com.fieldforce.entity.User;
import com.fieldforce.repository.EmergencyIncidentRepository;
import com.fieldforce.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/emergency")
public class EmergencyController {

    private final EmergencyIncidentRepository emergencyIncidentRepository;
    private final UserRepository userRepository;

    public EmergencyController(EmergencyIncidentRepository emergencyIncidentRepository,
                               UserRepository userRepository) {
        this.emergencyIncidentRepository = emergencyIncidentRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> report(@RequestBody EmergencyRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        EmergencyIncident e = new EmergencyIncident();
        e.setUser(user);
        e.setTitle(request.getTitle() != null && !request.getTitle().isBlank()
                ? request.getTitle().trim() : "SOS — emergency");
        e.setDescription(request.getDescription());
        e.setLatitude(request.getLatitude());
        e.setLongitude(request.getLongitude());
        e.setAccuracy(request.getAccuracy());
        emergencyIncidentRepository.save(e);

        return ResponseEntity.ok(EmergencyResponse.from(e));
    }

    @GetMapping("/list")
    public ResponseEntity<List<EmergencyResponse>> list() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean allowed = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> "ROLE_ADMIN".equals(a) || "ROLE_SUPERVISOR".equals(a));
        if (!allowed) {
            return ResponseEntity.status(403).build();
        }

        List<EmergencyResponse> rows = emergencyIncidentRepository.findAllWithUserOrderByCreatedAtDesc().stream()
                .map(EmergencyResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rows);
    }
}
