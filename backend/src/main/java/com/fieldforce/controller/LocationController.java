package com.fieldforce.controller;

import com.fieldforce.dto.LatestLocationResponse;
import com.fieldforce.dto.LocationUpdateRequest;
import com.fieldforce.entity.Attendance;
import com.fieldforce.entity.GpsLog;
import com.fieldforce.entity.User;
import com.fieldforce.repository.AttendanceRepository;
import com.fieldforce.repository.GpsLogRepository;
import com.fieldforce.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/location")
public class LocationController {

    private final GpsLogRepository gpsLogRepository;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;

    public LocationController(GpsLogRepository gpsLogRepository, UserRepository userRepository,
                              AttendanceRepository attendanceRepository) {
        this.gpsLogRepository = gpsLogRepository;
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateLocation(@RequestBody LocationUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();

        User user = userRepository.findByEmail(currentPrincipalName)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("Error: User not found");
        }

        GpsLog gpsLog = new GpsLog();
        gpsLog.setUser(user);
        gpsLog.setLatitude(request.getLatitude());
        gpsLog.setLongitude(request.getLongitude());
        gpsLog.setAccuracy(request.getAccuracy());
        gpsLog.setRecordedAt(LocalDateTime.now());

        gpsLogRepository.save(gpsLog);

        return ResponseEntity.ok("Location updated successfully");
    }

    /**
     * All registered workers with their most recent GPS fix (if any).
     * Locations come from real device reports via POST /api/location/update or sync.
     */
    @GetMapping("/latest")
    @Transactional(readOnly = true)
    public ResponseEntity<List<LatestLocationResponse>> getLatestLocations() {
        List<User> workers = userRepository.findByRole(User.Role.WORKER);
        List<GpsLog> latestLogs = gpsLogRepository.findLatestLocations();

        Map<Long, GpsLog> logByUserId = latestLogs.stream()
                .collect(Collectors.toMap(g -> g.getUser().getUserId(), g -> g, (a, b) -> a));

        // Find which workers have an open attendance session today
        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.plusDays(1).atStartOfDay();

        Set<Long> workersWithOpenSession = workers.stream()
                .filter(u -> {
                    Attendance open = attendanceRepository
                            .findFirstByUser_UserIdAndCheckOutTimeIsNullAndCheckInTimeBetweenOrderByCheckInTimeDesc(
                                    u.getUserId(), dayStart, dayEnd);
                    return open != null;
                })
                .map(User::getUserId)
                .collect(Collectors.toSet());

        List<LatestLocationResponse> responses = workers.stream().map(user -> {
            GpsLog log = logByUserId.get(user.getUserId());
            String phone = user.getPhone() != null ? user.getPhone() : "";
            String status = user.getStatus() != null ? user.getStatus().name() : "ACTIVE";
            boolean checkedOut = !workersWithOpenSession.contains(user.getUserId());
            if (log == null) {
                LatestLocationResponse r = new LatestLocationResponse();
                r.setUserId(user.getUserId());
                r.setUserName(user.getName());
                r.setEmployeeCode(user.getEmployeeCode());
                r.setDepartment(user.getDepartment());
                r.setPhone(phone);
                r.setUserStatus(status);
                r.setCheckedOut(checkedOut);
                return r;
            }
            LatestLocationResponse r = new LatestLocationResponse();
            r.setUserId(user.getUserId());
            r.setUserName(user.getName());
            r.setEmployeeCode(user.getEmployeeCode());
            r.setDepartment(user.getDepartment());
            r.setPhone(phone);
            r.setUserStatus(status);
            r.setLatitude(log.getLatitude());
            r.setLongitude(log.getLongitude());
            r.setAccuracy(log.getAccuracy());
            r.setRecordedAt(log.getRecordedAt());
            r.setCheckedOut(checkedOut);
            return r;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }
}
