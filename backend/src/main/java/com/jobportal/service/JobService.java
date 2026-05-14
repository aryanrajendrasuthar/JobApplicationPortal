package com.jobportal.service;

import com.jobportal.document.JobDescription;
import com.jobportal.dto.JobRequest;
import com.jobportal.dto.JobResponse;
import com.jobportal.entity.Company;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobService {

    private final JobRepository jobRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    @Transactional
    public JobResponse createJob(JobRequest request, Long employerId) {
        Company company = companyRepository.findByEmployerId(employerId)
            .orElseThrow(() -> new ResourceNotFoundException("Create a company profile first"));

        Job job = Job.builder()
            .companyId(company.getId())
            .title(request.getTitle())
            .location(request.getLocation())
            .type(request.getType())
            .salaryMin(request.getSalaryMin())
            .salaryMax(request.getSalaryMax())
            .requiredSkills(request.getRequiredSkills() != null ? request.getRequiredSkills() : new ArrayList<>())
            .experienceLevel(request.getExperienceLevel())
            .expiresAt(request.getExpiresAt())
            .status(Job.JobStatus.ACTIVE)
            .build();

        job = jobRepository.save(job);

        JobDescription desc = JobDescription.builder()
            .jobId(job.getId())
            .fullDescription(request.getFullDescription())
            .benefits(request.getBenefits())
            .requirements(request.getRequirements())
            .responsibilities(request.getResponsibilities())
            .aboutRole(request.getAboutRole())
            .build();
        jobDescriptionRepository.save(desc);

        evictSearchCache();
        return toResponse(job, company, null, false);
    }

    public Page<JobResponse> searchJobs(
        String keyword, String location, String type,
        BigDecimal salaryMin, BigDecimal salaryMax,
        String experienceLevel, int page, int size,
        String sortBy, Long currentUserId
    ) {
        String cacheKey = buildCacheKey(keyword, location, type, salaryMin, salaryMax, experienceLevel, page, size, sortBy);
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached instanceof Page<?>) {
            log.debug("Cache hit: {}", cacheKey);
        }

        Job.JobType jobType = type != null && !type.isBlank() ? Job.JobType.valueOf(type) : null;
        Sort sort = switch (sortBy != null ? sortBy : "newest") {
            case "salary" -> Sort.by(Sort.Direction.DESC, "salaryMax");
            default -> Sort.by(Sort.Direction.DESC, "postedAt");
        };
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Job> jobs = jobRepository.searchJobs(
            keyword, location, jobType, salaryMin, salaryMax, experienceLevel, pageable
        );

        Set<Long> savedJobIds = getSavedJobIds(currentUserId);

        Page<JobResponse> result = jobs.map(job -> {
            Company company = companyRepository.findById(job.getCompanyId()).orElse(null);
            long appCount = applicationRepository.countByJobId(job.getId());
            return toResponse(job, company, appCount, savedJobIds.contains(job.getId()));
        });

        redisTemplate.opsForValue().set(cacheKey, result, Duration.ofMinutes(5));
        return result;
    }

    public JobResponse getJobById(Long jobId, Long currentUserId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job", jobId));
        Company company = companyRepository.findById(job.getCompanyId()).orElse(null);
        long appCount = applicationRepository.countByJobId(jobId);
        Set<Long> savedJobIds = getSavedJobIds(currentUserId);

        JobResponse response = toResponse(job, company, appCount, savedJobIds.contains(jobId));

        jobDescriptionRepository.findByJobId(jobId).ifPresent(desc -> {
            response.setFullDescription(desc.getFullDescription());
            response.setBenefits(desc.getBenefits());
            response.setRequirements(desc.getRequirements());
            response.setResponsibilities(desc.getResponsibilities());
            response.setAboutRole(desc.getAboutRole());
        });

        return response;
    }

    public List<JobResponse> getLatestJobs() {
        return jobRepository.findTop6ByStatusOrderByPostedAtDesc(Job.JobStatus.ACTIVE).stream()
            .map(job -> {
                Company company = companyRepository.findById(job.getCompanyId()).orElse(null);
                return toResponse(job, company, null, false);
            }).toList();
    }

    public List<JobResponse> getJobsByCompany(Long companyId) {
        return jobRepository.findByCompanyId(companyId).stream()
            .map(job -> toResponse(job, null, applicationRepository.countByJobId(job.getId()), false))
            .toList();
    }

    public List<JobResponse> getEmployerJobs(Long employerId) {
        Company company = companyRepository.findByEmployerId(employerId)
            .orElseThrow(() -> new ResourceNotFoundException("Company not found for employer"));
        return jobRepository.findByCompanyId(company.getId()).stream()
            .map(job -> toResponse(job, company, applicationRepository.countByJobId(job.getId()), false))
            .toList();
    }

    @Transactional
    public JobResponse updateJob(Long jobId, JobRequest request, Long employerId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job", jobId));
        Company company = companyRepository.findByEmployerId(employerId)
            .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        if (!job.getCompanyId().equals(company.getId())) {
            throw new ResourceNotFoundException("Job not found for this employer");
        }

        job.setTitle(request.getTitle());
        job.setLocation(request.getLocation());
        job.setType(request.getType());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setRequiredSkills(request.getRequiredSkills());
        job.setExperienceLevel(request.getExperienceLevel());
        job = jobRepository.save(job);

        jobDescriptionRepository.findByJobId(jobId).ifPresent(desc -> {
            desc.setFullDescription(request.getFullDescription());
            desc.setBenefits(request.getBenefits());
            desc.setRequirements(request.getRequirements());
            desc.setResponsibilities(request.getResponsibilities());
            jobDescriptionRepository.save(desc);
        });

        evictSearchCache();
        return toResponse(job, company, null, false);
    }

    @Transactional
    public void closeJob(Long jobId, Long employerId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job", jobId));
        Company company = companyRepository.findByEmployerId(employerId).orElseThrow();
        if (!job.getCompanyId().equals(company.getId())) throw new ResourceNotFoundException("Not authorized");
        job.setStatus(Job.JobStatus.CLOSED);
        jobRepository.save(job);
        evictSearchCache();
    }

    @Transactional
    public List<Long> toggleSaveJob(Long jobId, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        List<Long> savedIds = user.getSavedJobIds() != null ? new ArrayList<>(user.getSavedJobIds()) : new ArrayList<>();
        if (savedIds.contains(jobId)) savedIds.remove(jobId);
        else savedIds.add(jobId);
        user.setSavedJobIds(savedIds);
        userRepository.save(user);
        return savedIds;
    }

    public List<JobResponse> getSavedJobs(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (user.getSavedJobIds() == null || user.getSavedJobIds().isEmpty()) return List.of();
        return user.getSavedJobIds().stream()
            .map(id -> jobRepository.findById(id).orElse(null))
            .filter(Objects::nonNull)
            .map(job -> {
                Company company = companyRepository.findById(job.getCompanyId()).orElse(null);
                return toResponse(job, company, null, true);
            }).toList();
    }

    private Set<Long> getSavedJobIds(Long userId) {
        if (userId == null) return Set.of();
        return userRepository.findById(userId)
            .map(u -> u.getSavedJobIds() != null ? new HashSet<>(u.getSavedJobIds()) : new HashSet<Long>())
            .orElseGet(HashSet::new);
    }

    private JobResponse toResponse(Job job, Company company, Long appCount, boolean saved) {
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
            .expiresAt(job.getExpiresAt())
            .applicationCount(appCount != null ? appCount : 0)
            .saved(saved)
            .build();
    }

    private String buildCacheKey(Object... parts) {
        return "jobs:search:" + Arrays.toString(parts).hashCode();
    }

    private void evictSearchCache() {
        Set<String> keys = redisTemplate.keys("jobs:search:*");
        if (keys != null && !keys.isEmpty()) redisTemplate.delete(keys);
    }
}
