package com.fieldforce.controller;

import com.fieldforce.dto.JwtResponse;
import com.fieldforce.dto.LoginRequest;
import com.fieldforce.dto.SignupRequest;
import com.fieldforce.entity.User;
import com.fieldforce.repository.UserRepository;
import com.fieldforce.security.JwtUtil;
import com.fieldforce.security.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
                          PasswordEncoder encoder, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    @Transactional(readOnly = true)
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        User user = userRepository.findByEmailWithSupervisor(loginRequest.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Error: User record not found.");
        }

        if (user.getRole() == User.Role.WORKER) {
            String code = loginRequest.getSupervisorEmployeeCode();
            if (code == null || code.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Error: Supervisor ID is required for worker login.");
            }
            User supervisor = userRepository.findByEmployeeCode(code.trim()).orElse(null);
            if (supervisor == null || supervisor.getRole() != User.Role.SUPERVISOR) {
                return ResponseEntity.badRequest().body("Error: Invalid supervisor ID.");
            }
            if (user.getSupervisor() == null || !user.getSupervisor().getUserId().equals(supervisor.getUserId())) {
                return ResponseEntity.badRequest().body("Error: Supervisor ID does not match your account.");
            }
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        Long supId = null;
        String supName = null;
        String supCode = null;
        if (user.getSupervisor() != null) {
            supId = user.getSupervisor().getUserId();
            supName = user.getSupervisor().getName();
            supCode = user.getSupervisor().getEmployeeCode();
        }

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                user.getEmail(),
                user.getEmail(),
                roles,
                supId,
                supName,
                supCode
        ));
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        if (userRepository.findByEmployeeCode(signUpRequest.getEmployeeCode()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Employee Code is already in use!");
        }

        User user = new User();
        user.setEmployeeCode(signUpRequest.getEmployeeCode());
        user.setName(signUpRequest.getName());
        user.setDepartment(signUpRequest.getDepartment());
        user.setPhone(signUpRequest.getPhone());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        User.Role roleEnum;
        try {
            roleEnum = User.Role.valueOf(signUpRequest.getRole());
        } catch (IllegalArgumentException e) {
            roleEnum = User.Role.WORKER;
        }
        user.setRole(roleEnum);

        if (roleEnum == User.Role.WORKER) {
            String supCode = signUpRequest.getSupervisorEmployeeCode();
            if (supCode == null || supCode.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Error: Supervisor ID is required for worker registration.");
            }
            User supervisor = userRepository.findByEmployeeCode(supCode.trim()).orElse(null);
            if (supervisor == null || supervisor.getRole() != User.Role.SUPERVISOR) {
                return ResponseEntity.badRequest().body("Error: Invalid supervisor ID.");
            }
            user.setSupervisor(supervisor);
        }

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }
}
