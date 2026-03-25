package com.fieldforce.controller;

import com.fieldforce.dto.SyncRequest;
import com.fieldforce.entity.*;
import com.fieldforce.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/sync")
public class SyncController {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final GpsLogRepository gpsLogRepository;
    private final TaskRepository taskRepository;
    private final TaskLocationRepository taskLocationRepository;

    public SyncController(UserRepository userRepository,
                          AttendanceRepository attendanceRepository,
                          GpsLogRepository gpsLogRepository,
                          TaskRepository taskRepository,
                          TaskLocationRepository taskLocationRepository) {
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
        this.gpsLogRepository = gpsLogRepository;
        this.taskRepository = taskRepository;
        this.taskLocationRepository = taskLocationRepository;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> syncOfflineData(@RequestBody SyncRequest syncRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        
        User user = userRepository.findByEmail(currentPrincipalName)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("Error: User not found!");
        }

        if (syncRequest.getAttendances() != null) {
            for (Attendance attendance : syncRequest.getAttendances()) {
                attendance.setUser(user);
                attendance.setAttendanceId(null);
                attendanceRepository.save(attendance);
            }
        }

        if (syncRequest.getGpsLogs() != null) {
            for (GpsLog log : syncRequest.getGpsLogs()) {
                log.setUser(user);
                log.setGpsId(null);
                gpsLogRepository.save(log);
            }
        }

        if (syncRequest.getTasks() != null) {
            for (Task task : syncRequest.getTasks()) {
                task.setAssignedTo(user);
                task.setTaskId(null);
                taskRepository.save(task);
            }
        }

        if (syncRequest.getTaskLocations() != null) {
            for (TaskLocation loc : syncRequest.getTaskLocations()) {
                loc.setId(null);
                taskLocationRepository.save(loc);
            }
        }
        
        return ResponseEntity.ok("Sync offline SQLite data batch to MySQL database successfully.");
    }
}
