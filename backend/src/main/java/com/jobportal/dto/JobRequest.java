package com.jobportal.dto;

import com.jobportal.entity.Job;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class JobRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String location;

    @NotNull
    private Job.JobType type;

    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private List<String> requiredSkills;
    private String experienceLevel;
    private LocalDateTime expiresAt;

    // MongoDB fields
    @NotBlank
    private String fullDescription;
    private String benefits;
    private List<String> requirements;
    private List<String> responsibilities;
    private String aboutRole;
}
