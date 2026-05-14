package com.jobportal.service;

import com.jobportal.dto.UserProfileRequest;
import com.jobportal.entity.User;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final S3Service s3Service;

    public User getById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    @Transactional
    public User updateProfile(Long userId, UserProfileRequest request) {
        User user = getById(userId);
        if (request.getName() != null) user.setName(request.getName());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getSkills() != null) user.setSkills(request.getSkills());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        return userRepository.save(user);
    }

    @Transactional
    public User uploadAvatar(Long userId, MultipartFile file) throws IOException {
        User user = getById(userId);
        String url = s3Service.uploadAvatar(file, userId);
        user.setAvatarUrl(url);
        return userRepository.save(user);
    }
}
