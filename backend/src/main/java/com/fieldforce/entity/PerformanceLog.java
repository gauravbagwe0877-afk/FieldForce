package com.fieldforce.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "performance_logs")
@Data
@NoArgsConstructor
public class PerformanceLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 255)
    private String action;

    @Column(length = 50)
    private String entityType;

    private Long entityId;

    private LocalDateTime timestamp = LocalDateTime.now();
}
