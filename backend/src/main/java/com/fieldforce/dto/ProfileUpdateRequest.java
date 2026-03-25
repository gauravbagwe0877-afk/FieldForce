package com.fieldforce.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String address;
    private String phone;
    private String bloodGroup;
}
