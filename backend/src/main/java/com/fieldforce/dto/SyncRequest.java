package com.fieldforce.dto;

import com.fieldforce.entity.Attendance;
import com.fieldforce.entity.GpsLog;
import com.fieldforce.entity.Task;
import com.fieldforce.entity.TaskLocation;
import lombok.Data;

import java.util.List;

@Data
public class SyncRequest {
    private List<Attendance> attendances;
    private List<GpsLog> gpsLogs;
    private List<Task> tasks;
    private List<TaskLocation> taskLocations;
}
