package com.fieldforce.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long taskId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private TaskType taskType;

    private LocalDateTime startTime;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TaskType {
        WASTE_COLLECTION, SWEEPING, ROAD_WORK, WATER_MAINTENANCE
    }
}
