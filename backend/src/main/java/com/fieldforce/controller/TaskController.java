package com.fieldforce.controller;

import com.fieldforce.dto.TaskRequest;
import com.fieldforce.dto.TaskResponse;
import com.fieldforce.entity.Task;
import com.fieldforce.entity.User;
import com.fieldforce.repository.TaskRepository;
import com.fieldforce.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskController(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createTask(@RequestBody TaskRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);

        if (currentUser == null || currentUser.getRole() == User.Role.WORKER) {
            return ResponseEntity.status(403).body("Error: Only supervisors or admins can assign tasks.");
        }

        User assignedTo = userRepository.findById(request.getAssignedToId()).orElse(null);
        if (assignedTo == null) {
            return ResponseEntity.badRequest().body("Error: Worker not found.");
        }

        Task task = new Task();
        task.setTaskTitle(request.getTaskTitle());
        task.setDescription(request.getDescription());
        task.setAssignedTo(assignedTo);
        task.setAssignedBy(currentUser);
        task.setTaskType(request.getTaskType());
        task.setPriority(request.getPriority());
        task.setStatus(Task.TaskStatus.PENDING);

        taskRepository.save(task);
        return ResponseEntity.ok(TaskResponse.from(task));
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<TaskResponse>> getMyTasks() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
        if (currentUser == null) return ResponseEntity.status(401).build();

        List<Task> tasks;
        if (currentUser.getRole() == User.Role.ADMIN) {
            tasks = taskRepository.findAll();
        } else if (currentUser.getRole() == User.Role.SUPERVISOR) {
            tasks = taskRepository.findByAssignedBy_UserId(currentUser.getUserId());
        } else {
            tasks = taskRepository.findByAssignedTo_UserId(currentUser.getUserId());
        }

        List<TaskResponse> responses = tasks.stream()
                .map(TaskResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{taskId}/status")
    @Transactional
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long taskId, @RequestParam Task.TaskStatus status) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) return ResponseEntity.notFound().build();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
        if (currentUser == null) return ResponseEntity.status(401).build();

        // Only assigned worker or the assigner can change status
        if (!task.getAssignedTo().getUserId().equals(currentUser.getUserId()) && 
            !task.getAssignedBy().getUserId().equals(currentUser.getUserId())) {
            return ResponseEntity.status(403).body("Error: Not authorized to update this task.");
        }

        task.setStatus(status);
        if (status == Task.TaskStatus.IN_PROGRESS && task.getStartTime() == null) {
            task.setStartTime(LocalDateTime.now());
        } else if (status == Task.TaskStatus.COMPLETED) {
            task.setEndTime(LocalDateTime.now());
        }

        taskRepository.save(task);
        return ResponseEntity.ok(TaskResponse.from(task));
    }
}
