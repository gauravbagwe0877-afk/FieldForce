package com.fieldforce.dto;

import com.fieldforce.entity.Task;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TaskRequest {
    private String taskTitle;
    private String description;
    private Long assignedToId;
    private Task.TaskType taskType;
    private Task.Priority priority;
}
