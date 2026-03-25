package com.fieldforce.repository;

import com.fieldforce.entity.GpsLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GpsLogRepository extends JpaRepository<GpsLog, Long> {
    @Query(value = "SELECT g1.* FROM gps_logs g1 INNER JOIN (SELECT user_id, MAX(recorded_at) as max_date FROM gps_logs GROUP BY user_id) g2 ON g1.user_id = g2.user_id AND g1.recorded_at = g2.max_date", nativeQuery = true)
    List<GpsLog> findLatestLocations();
}
