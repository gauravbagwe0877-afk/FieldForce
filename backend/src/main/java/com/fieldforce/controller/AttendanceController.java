package com.fieldforce.controller;

import com.fieldforce.dto.CheckInRequest;
import com.fieldforce.dto.TodayAttendanceResponse;
import com.fieldforce.entity.Attendance;
import com.fieldforce.entity.User;
import com.fieldforce.repository.AttendanceRepository;
import com.fieldforce.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public AttendanceController(AttendanceRepository attendanceRepository, UserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(@RequestBody CheckInRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        Attendance a = new Attendance();
        a.setUser(user);
        a.setCheckInTime(LocalDateTime.now());
        a.setCheckInLat(request.getLatitude());
        a.setCheckInLng(request.getLongitude());
        attendanceRepository.save(a);

        return ResponseEntity.ok("Checked in");
    }

    @GetMapping("/today")
    public ResponseEntity<TodayAttendanceResponse> today() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        List<Attendance> list = attendanceRepository.findByUser_UserIdAndCheckInTimeBetween(
                user.getUserId(), start, end);

        LocalDateTime now = LocalDateTime.now();
        double hours = 0;
        LocalDateTime firstIn = null;
        for (Attendance a : list) {
            if (a.getCheckInTime() == null) continue;
            if (firstIn == null || a.getCheckInTime().isBefore(firstIn)) {
                firstIn = a.getCheckInTime();
            }
            LocalDateTime segmentEnd = a.getCheckOutTime() != null ? a.getCheckOutTime() : now;
            if (segmentEnd.isBefore(a.getCheckInTime())) {
                segmentEnd = now;
            }
            hours += Duration.between(a.getCheckInTime(), segmentEnd).toMinutes() / 60.0;
        }

        boolean open = list.stream().anyMatch(a -> a.getCheckInTime() != null && a.getCheckOutTime() == null);
        LocalDateTime lastOut = list.stream()
                .map(Attendance::getCheckOutTime)
                .filter(t -> t != null)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        TodayAttendanceResponse res = new TodayAttendanceResponse(
                firstIn,
                lastOut,
                Math.round(hours * 100.0) / 100.0,
                open
        );
        return ResponseEntity.ok(res);
    }

    @PostMapping("/check-out")
    public ResponseEntity<?> checkOut(@RequestBody CheckInRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        Attendance openSession = attendanceRepository
                .findFirstByUser_UserIdAndCheckOutTimeIsNullAndCheckInTimeBetweenOrderByCheckInTimeDesc(
                        user.getUserId(), start, end);

        if (openSession == null) {
            return ResponseEntity.badRequest().body("No open check-in session found for today. Please check in first.");
        }

        openSession.setCheckOutTime(LocalDateTime.now());
        openSession.setCheckOutLat(request.getLatitude());
        openSession.setCheckOutLng(request.getLongitude());
        attendanceRepository.save(openSession);

        return ResponseEntity.ok("Checked out");
    }
}
