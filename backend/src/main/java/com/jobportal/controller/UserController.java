package com.jobportal.controller;

import com.jobportal.document.Resume;
import com.jobportal.dto.UserProfileRequest;
import com.jobportal.entity.User;
import com.jobportal.service.ResumeService;
import com.jobportal.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ResumeService resumeService;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getById(extractUserId(userDetails)));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
        @RequestBody UserProfileRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(userService.updateProfile(extractUserId(userDetails), request));
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<User> uploadAvatar(
        @RequestParam("file") MultipartFile file,
        @AuthenticationPrincipal UserDetails userDetails
    ) throws IOException {
        return ResponseEntity.ok(userService.uploadAvatar(extractUserId(userDetails), file));
    }

    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<Resume> uploadResume(
        @RequestParam("file") MultipartFile file,
        @AuthenticationPrincipal UserDetails userDetails
    ) throws IOException {
        return ResponseEntity.ok(resumeService.uploadAndParseResume(file, extractUserId(userDetails)));
    }

    @GetMapping("/resume")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<Optional<Resume>> getResume(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(resumeService.getResumeByUserId(extractUserId(userDetails)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPublicProfile(@PathVariable Long id) {
        User user = userService.getById(id);
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
            "location", user.getLocation() != null ? user.getLocation() : "",
            "bio", user.getBio() != null ? user.getBio() : "",
            "skills", user.getSkills() != null ? user.getSkills() : java.util.List.of()
        ));
    }

    private Long extractUserId(UserDetails userDetails) {
        return Long.parseLong(userDetails.getUsername());
    }
}
