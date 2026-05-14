package com.jobportal.controller;

import com.jobportal.dto.JobResponse;
import com.jobportal.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<List<JobResponse>> getRecommendations(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(recommendationService.getRecommendations(
            Long.parseLong(userDetails.getUsername())
        ));
    }
}
