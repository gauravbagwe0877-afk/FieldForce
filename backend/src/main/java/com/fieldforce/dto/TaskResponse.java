package com.fieldforce.dto;

import com.fieldforce.entity.Task;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class TaskResponse {
    private Long taskId;
    private String taskTitle;
    private String description;
    private String taskType;
    private String status;
    private String priority;
    private String assignedToName;
    private String assignedToEmployeeCode;
    private String assignedByName;
    private LocalDateTime createdAt;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    public static TaskResponse from(Task task) {
        TaskResponse res = new TaskResponse();
        res.setTaskId(task.getTaskId());
        res.setTaskTitle(task.getTaskTitle());
        res.setDescription(task.getDescription());
        res.setTaskType(task.getTaskType().name());
        res.setStatus(task.getStatus().name());
        res.setPriority(task.getPriority().name());
        if (task.getAssignedTo() != null) {
            res.setAssignedToName(task.getAssignedTo().getName());
            res.setAssignedToEmployeeCode(task.getAssignedTo().getEmployeeCode());
        }
        if (task.getAssignedBy() != null) {
            res.setAssignedByName(task.getAssignedBy().getName());
        }
        res.setCreatedAt(task.getCreatedAt());
        res.setStartTime(task.getStartTime());
        res.setEndTime(task.getEndTime());
        return res;
    }
}
