package com.jobportal.service;

import com.jobportal.dto.JobResponse;
import com.jobportal.entity.Company;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.CompanyRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationRepository applicationRepository;

    public List<JobResponse> getRecommendations(Long seekerId) {
        User seeker = userRepository.findById(seekerId)
            .orElseThrow(() -> new ResourceNotFoundException("User", seekerId));

        List<String> seekerSkills = seeker.getSkills();
        if (seekerSkills == null || seekerSkills.isEmpty()) {
            return jobRepository.findTop6ByStatusOrderByPostedAtDesc(Job.JobStatus.ACTIVE)
                .stream().map(j -> toResponse(j, companyRepository.findById(j.getCompanyId()).orElse(null)))
                .collect(Collectors.toList());
        }

        List<String> lowerSkills = seekerSkills.stream()
            .map(String::toLowerCase)
            .collect(Collectors.toList());

        Set<Long> appliedJobIds = applicationRepository.findBySeekerIdOrderByAppliedAtDesc(seekerId)
            .stream().map(a -> a.getJobId()).collect(Collectors.toSet());

        return jobRepository.findByStatus(Job.JobStatus.ACTIVE,
                org.springframework.data.domain.PageRequest.of(0, 100)).stream()
            .filter(job -> !appliedJobIds.contains(job.getId()))
            .map(job -> {
                int score = scoreJob(job, lowerSkills);
                return Map.entry(job, score);
            })
            .filter(e -> e.getValue() > 0)
            .sorted(Map.Entry.<Job, Integer>comparingByValue().reversed())
            .limit(10)
            .map(e -> toResponse(e.getKey(), companyRepository.findById(e.getKey().getCompanyId()).orElse(null)))
            .collect(Collectors.toList());
    }

    private int scoreJob(Job job, List<String> lowerSeekerSkills) {
        if (job.getRequiredSkills() == null || job.getRequiredSkills().isEmpty()) return 0;
        long matches = job.getRequiredSkills().stream()
            .map(String::toLowerCase)
            .filter(lowerSeekerSkills::contains)
            .count();
        return (int) matches;
    }

    private JobResponse toResponse(Job job, Company company) {
        return JobResponse.builder()
            .id(job.getId())
            .companyId(job.getCompanyId())
            .companyName(company != null ? company.getName() : null)
            .companyLogoUrl(company != null ? company.getLogoUrl() : null)
            .companyIndustry(company != null ? company.getIndustry() : null)
            .title(job.getTitle())
            .location(job.getLocation())
            .type(job.getType())
            .salaryMin(job.getSalaryMin())
            .salaryMax(job.getSalaryMax())
            .requiredSkills(job.getRequiredSkills())
            .status(job.getStatus())
            .experienceLevel(job.getExperienceLevel())
            .postedAt(job.getPostedAt())
            .build();
    }
}
