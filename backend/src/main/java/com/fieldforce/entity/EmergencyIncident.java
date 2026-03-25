package com.fieldforce.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_incidents")
@Data
@NoArgsConstructor
public class EmergencyIncident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long incidentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 200)
    private String title;

    @Column(length = 2000)
    private String description;

    private Double latitude;

    private Double longitude;

    private Float accuracy;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.OPEN;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime acknowledgedAt;

    private LocalDateTime resolvedAt;

    public enum Status {
        OPEN, ACKNOWLEDGED, RESOLVED
    }
}
