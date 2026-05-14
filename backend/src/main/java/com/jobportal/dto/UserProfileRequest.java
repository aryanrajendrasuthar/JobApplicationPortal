package com.jobportal.dto;

import lombok.Data;

import java.util.List;

@Data
public class UserProfileRequest {
    private String name;
    private String location;
    private String bio;
    private String phone;
    private List<String> skills;
    private String avatarUrl;
}
