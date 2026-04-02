package com.fieldforce.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class AnalyticsResponse {
    private long totalWorkers;
    private long activeWorkers;
    private long totalTasks;
    private long completedTasks;
    private double totalDistanceKm;
    private List<WorkerMetric> topWorkers;

    @Data
    @NoArgsConstructor
    public static class WorkerMetric {
        private String name;
        private String employeeCode;
        private long tasksCompleted;
        private double distanceKm;
    }
}
