package com.fieldforce.dto;

import com.fieldforce.entity.User;
import lombok.Data;

@Data
@SuppressWarnings("unused") // Fields read via Lombok getters for Jackson JSON responses
public class UserProfileResponse {
    private Long userId;
    private String employeeCode;
    private String name;
    private String email;
    private String phone;
    private String department;
    private String address;
    private String bloodGroup;
    private String role;
    private Long supervisorId;
    private String supervisorName;
    private String supervisorEmployeeCode;

    public static UserProfileResponse from(User u) {
        UserProfileResponse r = new UserProfileResponse();
        r.setUserId(u.getUserId());
        r.setEmployeeCode(u.getEmployeeCode());
        r.setName(u.getName());
        r.setEmail(u.getEmail());
        r.setPhone(u.getPhone());
        r.setDepartment(u.getDepartment());
        r.setAddress(u.getAddress());
        r.setBloodGroup(u.getBloodGroup());
        r.setRole(u.getRole() != null ? u.getRole().name() : null);
        if (u.getSupervisor() != null) {
            r.setSupervisorId(u.getSupervisor().getUserId());
            r.setSupervisorName(u.getSupervisor().getName());
            r.setSupervisorEmployeeCode(u.getSupervisor().getEmployeeCode());
        }
        return r;
    }
}
