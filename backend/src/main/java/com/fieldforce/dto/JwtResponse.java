package com.fieldforce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private Long id;
    private String email;
    /** Same as email; kept for older dashboard clients. */
    private String username;
    private List<String> roles;
    private Long supervisorId;
    private String supervisorName;
    private String supervisorEmployeeCode;
}
