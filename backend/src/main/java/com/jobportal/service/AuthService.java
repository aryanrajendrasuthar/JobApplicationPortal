package com.jobportal.service;

import com.jobportal.dto.AuthRequest;
import com.jobportal.dto.AuthResponse;
import com.jobportal.dto.RegisterRequest;
import com.jobportal.entity.Company;
import com.jobportal.entity.User;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.CompanyRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email already registered");
        }

        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .role(request.getRole())
            .skills(new ArrayList<>())
            .savedJobIds(new ArrayList<>())
            .build();

        user = userRepository.save(user);

        Long companyId = null;
        if (request.getRole() == User.Role.ROLE_EMPLOYER && request.getCompanyName() != null) {
            Company company = Company.builder()
                .name(request.getCompanyName())
                .industry(request.getCompanyIndustry())
                .location(request.getCompanyLocation())
                .employerId(user.getId())
                .build();
            company = companyRepository.save(company);
            companyId = company.getId();

            user.setCompanyId(companyId);
            userRepository.save(user);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
            .token(token)
            .userId(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole())
            .companyId(companyId)
            .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
            .token(token)
            .userId(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole())
            .companyId(user.getCompanyId())
            .avatarUrl(user.getAvatarUrl())
            .build();
    }

    public AuthResponse getMe(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        return AuthResponse.builder()
            .userId(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole())
            .companyId(user.getCompanyId())
            .avatarUrl(user.getAvatarUrl())
            .build();
    }
}
