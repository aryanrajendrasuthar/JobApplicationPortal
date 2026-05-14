package com.jobportal.controller;

import com.jobportal.dto.JobRequest;
import com.jobportal.dto.JobResponse;
import com.jobportal.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<Page<JobResponse>> searchJobs(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String location,
        @RequestParam(required = false) String type,
        @RequestParam(required = false) BigDecimal salaryMin,
        @RequestParam(required = false) BigDecimal salaryMax,
        @RequestParam(required = false) String experienceLevel,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "newest") String sortBy,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userDetails != null ? extractUserId(userDetails) : null;
        return ResponseEntity.ok(jobService.searchJobs(
            keyword, location, type, salaryMin, salaryMax, experienceLevel, page, size, sortBy, userId
        ));
    }

    @GetMapping("/latest")
    public ResponseEntity<List<JobResponse>> getLatestJobs() {
        return ResponseEntity.ok(jobService.getLatestJobs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userDetails != null ? extractUserId(userDetails) : null;
        return ResponseEntity.ok(jobService.getJobById(id, userId));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<JobResponse>> getJobsByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(jobService.getJobsByCompany(companyId));
    }

    @GetMapping("/employer/my-jobs")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<JobResponse>> getEmployerJobs(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.getEmployerJobs(extractUserId(userDetails)));
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<JobResponse> createJob(
        @Valid @RequestBody JobRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(jobService.createJob(request, extractUserId(userDetails)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<JobResponse> updateJob(
        @PathVariable Long id,
        @Valid @RequestBody JobRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(jobService.updateJob(id, request, extractUserId(userDetails)));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Void> closeJob(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        jobService.closeJob(id, extractUserId(userDetails));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/save")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<Map<String, Object>> toggleSaveJob(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<Long> savedIds = jobService.toggleSaveJob(id, extractUserId(userDetails));
        return ResponseEntity.ok(Map.of("savedJobIds", savedIds));
    }

    @GetMapping("/saved")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<List<JobResponse>> getSavedJobs(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.getSavedJobs(extractUserId(userDetails)));
    }

    private Long extractUserId(UserDetails userDetails) {
        return Long.parseLong(userDetails.getUsername());
    }
}
