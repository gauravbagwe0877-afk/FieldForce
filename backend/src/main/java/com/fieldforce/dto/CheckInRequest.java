package com.fieldforce.dto;

import lombok.Data;

@Data
public class CheckInRequest {
    private Double latitude;
    private Double longitude;
    private Float accuracy;
    private String zoneNote;
}
