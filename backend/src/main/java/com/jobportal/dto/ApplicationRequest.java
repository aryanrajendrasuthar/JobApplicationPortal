package com.jobportal.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplicationRequest {
    @NotNull
    private Long jobId;

    private String coverLetter;
    private String resumeUrl;
}
