package com.fieldforce.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;

    /** Required for workers: supervisor's employee code (must exist in MySQL). */
    private String supervisorEmployeeCode;
}
