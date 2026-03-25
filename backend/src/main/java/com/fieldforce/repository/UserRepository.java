package com.fieldforce.repository;

import com.fieldforce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmployeeCode(String employeeCode);
    Optional<User> findByEmail(String email);

    List<User> findByRole(User.Role role);
    List<User> findBySupervisor_UserId(Long supervisorId);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.supervisor WHERE u.email = :email")
    Optional<User> findByEmailWithSupervisor(@Param("email") String email);
}
