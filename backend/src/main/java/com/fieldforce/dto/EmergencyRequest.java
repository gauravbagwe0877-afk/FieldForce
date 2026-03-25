package com.fieldforce.dto;

import lombok.Data;

@Data
public class EmergencyRequest {
    private String title;
    private String description;
    private Double latitude;
    private Double longitude;
    private Float accuracy;
}
