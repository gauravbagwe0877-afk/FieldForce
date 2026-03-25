package com.fieldforce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TodayAttendanceResponse {
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    /** Total hours worked today from all sessions (open session counts until now). */
    private double hoursWorkedToday;
    private boolean checkedIn;
}
