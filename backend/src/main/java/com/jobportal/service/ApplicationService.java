package com.jobportal.service;

import com.jobportal.dto.ApplicationRequest;
import com.jobportal.dto.ApplicationResponse;
import com.jobportal.dto.StatusUpdateRequest;
import com.jobportal.entity.*;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final EmailService emailService;

    @Transactional
    public ApplicationResponse apply(ApplicationRequest request, Long seekerId) {
        Job job = jobRepository.findById(request.getJobId())
            .orElseThrow(() -> new ResourceNotFoundException("Job", request.getJobId()));

        if (job.getStatus() != Job.JobStatus.ACTIVE) {
            throw new IllegalStateException("This job is no longer accepting applications");
        }
        if (applicationRepository.existsByJobIdAndSeekerId(job.getId(), seekerId)) {
            throw new IllegalStateException("You have already applied to this job");
        }

        User seeker = userRepository.findById(seekerId)
            .orElseThrow(() -> new ResourceNotFoundException("User", seekerId));

        String resumeUrl = request.getResumeUrl() != null ? request.getResumeUrl() : seeker.getResumeUrl();

        Application application = Application.builder()
            .jobId(job.getId())
            .seekerId(seekerId)
            .resumeUrl(resumeUrl)
            .coverLetter(request.getCoverLetter())
            .status(Application.ApplicationStatus.APPLIED)
            .build();

        application = applicationRepository.save(application);

        Company company = companyRepository.findById(job.getCompanyId()).orElse(null);
        String companyName = company != null ? company.getName() : "Unknown";

        emailService.sendApplicationConfirmation(
            seeker.getEmail(), seeker.getName(), job.getTitle(), companyName
        );

        return toResponse(application, job, seeker, company);
    }

    public List<ApplicationResponse> getSeekerApplications(Long seekerId) {
        return applicationRepository.findBySeekerIdOrderByAppliedAtDesc(seekerId).stream()
            .map(app -> {
                Job job = jobRepository.findById(app.getJobId()).orElse(null);
                User seeker = userRepository.findById(app.getSeekerId()).orElse(null);
                Company company = job != null ? companyRepository.findById(job.getCompanyId()).orElse(null) : null;
                return toResponse(app, job, seeker, company);
            }).toList();
    }

    public Page<ApplicationResponse> getJobApplications(Long jobId, Long employerId, int page, int size) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job", jobId));
        Company company = companyRepository.findByEmployerId(employerId)
            .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        if (!job.getCompanyId().equals(company.getId())) {
            throw new ResourceNotFoundException("Job not found for this employer");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<Application> apps = applicationRepository.findByJobId(jobId, pageable);

        return apps.map(app -> {
            User seeker = userRepository.findById(app.getSeekerId()).orElse(null);
            return toResponse(app, job, seeker, company);
        });
    }

    @Transactional
    public ApplicationResponse updateStatus(Long applicationId, StatusUpdateRequest request, Long employerId) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application", applicationId));

        Job job = jobRepository.findById(application.getJobId())
            .orElseThrow(() -> new ResourceNotFoundException("Job", application.getJobId()));

        Company company = companyRepository.findByEmployerId(employerId)
            .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        if (!job.getCompanyId().equals(company.getId())) {
            throw new ResourceNotFoundException("Not authorized to update this application");
        }

        application.setStatus(request.getStatus());
        if (request.getEmployerNotes() != null) {
            application.setEmployerNotes(request.getEmployerNotes());
        }
        Application saved = applicationRepository.save(application);

        User seeker = userRepository.findById(saved.getSeekerId()).orElse(null);
        if (seeker != null) {
            emailService.sendApplicationStatusUpdate(
                seeker.getEmail(), seeker.getName(),
                job.getTitle(), company.getName(), request.getStatus()
            );
        }

        return toResponse(saved, job, seeker, company);
    }

    private ApplicationResponse toResponse(Application app, Job job, User seeker, Company company) {
        return ApplicationResponse.builder()
            .id(app.getId())
            .jobId(app.getJobId())
            .jobTitle(job != null ? job.getTitle() : null)
            .jobLocation(job != null ? job.getLocation() : null)
            .companyName(company != null ? company.getName() : null)
            .companyLogoUrl(company != null ? company.getLogoUrl() : null)
            .seekerId(app.getSeekerId())
            .seekerName(seeker != null ? seeker.getName() : null)
            .seekerEmail(seeker != null ? seeker.getEmail() : null)
            .seekerAvatarUrl(seeker != null ? seeker.getAvatarUrl() : null)
            .seekerSkills(seeker != null ? seeker.getSkills() : null)
            .resumeUrl(app.getResumeUrl())
            .coverLetter(app.getCoverLetter())
            .status(app.getStatus())
            .employerNotes(app.getEmployerNotes())
            .appliedAt(app.getAppliedAt())
            .updatedAt(app.getUpdatedAt())
            .build();
    }
}
