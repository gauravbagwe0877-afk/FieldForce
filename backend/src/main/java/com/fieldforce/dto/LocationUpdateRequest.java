package com.fieldforce.dto;

import lombok.Data;

@Data
public class LocationUpdateRequest {
    private Double latitude;
    private Double longitude;
    private Float accuracy;
}
