package com.fieldforce.repository;

import com.fieldforce.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByUser_UserIdAndCheckInTimeBetween(Long userId, LocalDateTime start, LocalDateTime end);

    /** Find the most recent open session (no checkout) for today */
    Attendance findFirstByUser_UserIdAndCheckOutTimeIsNullAndCheckInTimeBetweenOrderByCheckInTimeDesc(
            Long userId, LocalDateTime start, LocalDateTime end);
    @Query("SELECT COUNT(DISTINCT a.user.userId) FROM Attendance a WHERE a.checkInTime BETWEEN :start AND :end AND a.checkOutTime IS NULL")
    long countActiveWorkersByCheckInBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
}
