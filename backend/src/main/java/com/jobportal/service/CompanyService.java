package com.jobportal.service;

import com.jobportal.dto.CompanyRequest;
import com.jobportal.entity.Company;
import com.jobportal.entity.Job;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.CompanyRepository;
import com.jobportal.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final S3Service s3Service;

    public Company getById(Long id) {
        return companyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Company", id));
    }

    public Company getByEmployerId(Long employerId) {
        return companyRepository.findByEmployerId(employerId)
            .orElseThrow(() -> new ResourceNotFoundException("Company not found for employer"));
    }

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    public List<Company> searchByName(String name) {
        return companyRepository.findByNameContainingIgnoreCase(name);
    }

    @Transactional
    public Company createOrUpdate(Long employerId, CompanyRequest request) {
        Company company = companyRepository.findByEmployerId(employerId)
            .orElse(Company.builder().employerId(employerId).build());

        company.setName(request.getName());
        company.setIndustry(request.getIndustry());
        company.setCompanySize(request.getCompanySize());
        company.setLocation(request.getLocation());
        company.setWebsite(request.getWebsite());
        company.setDescription(request.getDescription());
        if (request.getLogoUrl() != null) company.setLogoUrl(request.getLogoUrl());

        return companyRepository.save(company);
    }

    public Company uploadLogo(Long companyId, MultipartFile file) throws IOException {
        Company company = getById(companyId);
        String url = s3Service.uploadCompanyLogo(file, companyId);
        company.setLogoUrl(url);
        return companyRepository.save(company);
    }

    public Map<String, Object> getCompanyProfile(Long companyId) {
        Company company = getById(companyId);
        List<Job> openJobs = jobRepository.findByCompanyId(companyId).stream()
            .filter(j -> j.getStatus() == Job.JobStatus.ACTIVE)
            .toList();

        return Map.of(
            "company", company,
            "openJobCount", openJobs.size(),
            "openJobs", openJobs
        );
    }
}
