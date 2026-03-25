package com.fieldforce.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LatestLocationResponse {
    private Long userId;

    /** Exposed as "name" in JSON for clients that expect a display name field. */
    @JsonProperty("name")
    private String userName;

    private String employeeCode;
    private String department;
    private String phone;

    /** ACTIVE / INACTIVE from the user record. */
    private String userStatus;

    private Double latitude;
    private Double longitude;
    private Float accuracy;
    private LocalDateTime recordedAt;

    /** true if the worker has checked out for the day (no open attendance session). */
    private Boolean checkedOut;
}
