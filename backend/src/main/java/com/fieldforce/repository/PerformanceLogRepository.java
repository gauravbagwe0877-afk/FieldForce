package com.fieldforce.repository;

import com.fieldforce.entity.PerformanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PerformanceLogRepository extends JpaRepository<PerformanceLog, Long> {
}
