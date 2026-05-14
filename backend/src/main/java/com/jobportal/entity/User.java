package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "resume_url")
    private String resumeUrl;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @ElementCollection
    @CollectionTable(name = "user_skills", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "skill")
    private List<String> skills;

    @Column(name = "company_id")
    private Long companyId;

    private String location;
    private String bio;
    private String phone;

    @Column(name = "google_id")
    private String googleId;

    @ElementCollection
    @CollectionTable(name = "saved_jobs", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "job_id")
    private List<Long> savedJobIds;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Role {
        ROLE_SEEKER, ROLE_EMPLOYER, ROLE_ADMIN
    }
}
