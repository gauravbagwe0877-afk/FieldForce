package com.fieldforce.repository;

import com.fieldforce.entity.EmergencyIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyIncidentRepository extends JpaRepository<EmergencyIncident, Long> {

    @Query("SELECT e FROM EmergencyIncident e JOIN FETCH e.user ORDER BY e.createdAt DESC")
    List<EmergencyIncident> findAllWithUserOrderByCreatedAtDesc();
}
