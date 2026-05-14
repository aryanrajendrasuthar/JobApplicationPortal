package com.jobportal.dto;

import com.jobportal.entity.Application;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ApplicationResponse {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String companyLogoUrl;
    private String jobLocation;
    private Long seekerId;
    private String seekerName;
    private String seekerEmail;
    private String seekerAvatarUrl;
    private List<String> seekerSkills;
    private String resumeUrl;
    private String coverLetter;
    private Application.ApplicationStatus status;
    private String employerNotes;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
