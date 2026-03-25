package com.fieldforce.repository;

import com.fieldforce.entity.TaskLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskLocationRepository extends JpaRepository<TaskLocation, Long> {
}
