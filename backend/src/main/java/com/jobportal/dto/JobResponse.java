package com.jobportal.dto;

import com.jobportal.entity.Job;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class JobResponse {
    private Long id;
    private Long companyId;
    private String companyName;
    private String companyLogoUrl;
    private String companyIndustry;
    private String title;
    private String location;
    private Job.JobType type;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private List<String> requiredSkills;
    private Job.JobStatus status;
    private String experienceLevel;
    private LocalDateTime postedAt;
    private LocalDateTime expiresAt;
    private long applicationCount;
    private boolean saved;

    // MongoDB fields
    private String fullDescription;
    private String benefits;
    private List<String> requirements;
    private List<String> responsibilities;
    private String aboutRole;
}
