package com.jobportal.dto;

import com.jobportal.entity.Application;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    @NotNull
    private Application.ApplicationStatus status;

    private String employerNotes;
}
