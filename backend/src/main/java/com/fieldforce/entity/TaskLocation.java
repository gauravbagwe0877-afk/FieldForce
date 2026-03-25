package com.fieldforce.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_locations")
@Data
@NoArgsConstructor
public class TaskLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @Column(columnDefinition = "DECIMAL(10,7)")
    private Double latitude;

    @Column(columnDefinition = "DECIMAL(10,7)")
    private Double longitude;

    private LocalDateTime recordedAt = LocalDateTime.now();
}
