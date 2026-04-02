package com.fieldforce.controller;

import com.fieldforce.dto.AnalyticsResponse;
import com.fieldforce.entity.Task;
import com.fieldforce.entity.User;
import com.fieldforce.repository.AttendanceRepository;
import com.fieldforce.repository.TaskRepository;
import com.fieldforce.repository.UserRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final AttendanceRepository attendanceRepository;

    public AnalyticsController(UserRepository userRepository, TaskRepository taskRepository,
                               AttendanceRepository attendanceRepository) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.attendanceRepository = attendanceRepository;
    }

    @GetMapping("/summary")
    @Transactional(readOnly = true)
    public ResponseEntity<AnalyticsResponse> getSummary() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
        if (currentUser == null || currentUser.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        AnalyticsResponse res = new AnalyticsResponse();
        res.setTotalWorkers(userRepository.findByRole(User.Role.WORKER).size());
        
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        
        res.setActiveWorkers(attendanceRepository.countActiveWorkersByCheckInBetween(start, end));
        res.setTotalTasks(taskRepository.count());
        res.setCompletedTasks(taskRepository.findAll().stream()
                .filter(t -> t.getStatus() == Task.TaskStatus.COMPLETED)
                .count());
        
        res.setTotalDistanceKm(124.5); // Simplified for demo
        
        List<User> workers = userRepository.findByRole(User.Role.WORKER);
        List<AnalyticsResponse.WorkerMetric> topWorkers = workers.stream().map(w -> {
            AnalyticsResponse.WorkerMetric m = new AnalyticsResponse.WorkerMetric();
            m.setName(w.getName());
            m.setEmployeeCode(w.getEmployeeCode());
            m.setTasksCompleted(taskRepository.findByAssignedTo_UserId(w.getUserId()).stream()
                    .filter(t -> t.getStatus() == Task.TaskStatus.COMPLETED).count());
            m.setDistanceKm(12.3); // Simplified
            return m;
        }).limit(5).collect(Collectors.toList());
        
        res.setTopWorkers(topWorkers);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/export/csv")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> exportCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("Worker Name,Employee Code,Department,Tasks Completed,Phone\n");
        
        List<User> workers = userRepository.findByRole(User.Role.WORKER);
        for (User w : workers) {
            long completed = taskRepository.findByAssignedTo_UserId(w.getUserId()).stream()
                    .filter(t -> t.getStatus() == Task.TaskStatus.COMPLETED).count();
            csv.append(String.format("%s,%s,%s,%d,%s\n", 
                    w.getName(), w.getEmployeeCode(), w.getDepartment(), completed, w.getPhone()));
        }

        byte[] bytes = csv.toString().getBytes();
        String filename = "fieldforce_analytics_" + LocalDate.now() + ".csv";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }
}
