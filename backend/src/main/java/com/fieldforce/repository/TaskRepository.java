package com.fieldforce.repository;

import com.fieldforce.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignedTo_UserId(Long userId);
    List<Task> findByAssignedBy_UserId(Long userId);
}
