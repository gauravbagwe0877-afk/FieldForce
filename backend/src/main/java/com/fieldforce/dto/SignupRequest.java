package com.fieldforce.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String employeeCode;
    private String name;
    private String department;
    private String phone;
    private String email;
    private String password;
    private String role;

    /** Required when role is WORKER: existing supervisor employee code in MySQL. */
    private String supervisorEmployeeCode;
}
