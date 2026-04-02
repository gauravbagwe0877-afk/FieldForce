package com.fieldforce.controller;

import com.fieldforce.entity.User;
import com.fieldforce.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final GpsLogRepository gpsLogRepository;
    private final TaskRepository taskRepository;
    private final TaskLocationRepository taskLocationRepository;

    public AdminController(UserRepository userRepository, AttendanceRepository attendanceRepository,
                           GpsLogRepository gpsLogRepository, TaskRepository taskRepository,
                           TaskLocationRepository taskLocationRepository) {
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
        this.gpsLogRepository = gpsLogRepository;
        this.taskRepository = taskRepository;
        this.taskLocationRepository = taskLocationRepository;
    }

    @PostMapping("/reset")
    @Transactional
    public ResponseEntity<?> resetData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
        
        if (currentUser == null || currentUser.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403).body("Error: Only admins can reset the database.");
        }

        // Delete data but KEEP the users with role ADMIN
        taskLocationRepository.deleteAll();
        taskRepository.deleteAll();
        gpsLogRepository.deleteAll();
        attendanceRepository.deleteAll();
        
        // Delete all users EXCEPT the current admin
        userRepository.findAll().stream()
                .filter(u -> u.getRole() != User.Role.ADMIN)
                .forEach(u -> userRepository.delete(u));

        return ResponseEntity.ok("Database reset successful. All worker data, tasks, and attendance logs have been cleared.");
    }
}
