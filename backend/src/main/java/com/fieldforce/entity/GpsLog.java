package com.fieldforce.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "gps_logs")
@Data
@NoArgsConstructor
public class GpsLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long gpsId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    /** ~1.1 mm precision at equator — suitable for field workforce tracking. */
    private Double latitude;

    private Double longitude;

    /** Meters (Android/iOS location accuracy). */
    private Float accuracy;

    private LocalDateTime recordedAt = LocalDateTime.now();
}
