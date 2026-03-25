package com.fieldforce.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(length = 50)
    private String employeeCode;

    @Column(length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Role role;

    @Column(length = 100)
    private String department;

    @Column(length = 15)
    private String phone;

    @Column(length = 100)
    private String email;

    /** Supervisor for workers; must be a user with role SUPERVISOR. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private User supervisor;

    @Column(length = 500)
    private String address;

    @Column(length = 10)
    private String bloodGroup;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.ACTIVE;

    @JsonIgnore
    private String password;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Role {
        ADMIN, SUPERVISOR, WORKER
    }

    public enum Status {
        ACTIVE, INACTIVE
    }
}
