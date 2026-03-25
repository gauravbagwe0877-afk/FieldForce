package com.fieldforce.dto;

import com.fieldforce.entity.EmergencyIncident;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EmergencyResponse {
    private Long incidentId;
    private Long userId;
    private String workerName;
    private String employeeCode;
    private String title;
    private String description;
    private Double latitude;
    private Double longitude;
    private Float accuracy;
    private String status;
    private LocalDateTime createdAt;

    public static EmergencyResponse from(EmergencyIncident e) {
        EmergencyResponse r = new EmergencyResponse();
        r.setIncidentId(e.getIncidentId());
        r.setUserId(e.getUser().getUserId());
        r.setWorkerName(e.getUser().getName());
        r.setEmployeeCode(e.getUser().getEmployeeCode());
        r.setTitle(e.getTitle());
        r.setDescription(e.getDescription());
        r.setLatitude(e.getLatitude());
        r.setLongitude(e.getLongitude());
        r.setAccuracy(e.getAccuracy());
        r.setStatus(e.getStatus().name());
        r.setCreatedAt(e.getCreatedAt());
        return r;
    }
}
