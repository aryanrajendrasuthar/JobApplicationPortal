package com.jobportal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompanyRequest {
    @NotBlank
    private String name;

    private String industry;
    private String companySize;
    private String location;
    private String website;
    private String description;
    private String logoUrl;
}
