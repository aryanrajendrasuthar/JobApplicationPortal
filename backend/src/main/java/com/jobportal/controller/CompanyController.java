package com.jobportal.controller;

import com.jobportal.dto.CompanyRequest;
import com.jobportal.entity.Company;
import com.jobportal.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Company>> searchCompanies(@RequestParam String name) {
        return ResponseEntity.ok(companyService.searchByName(name));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getById(id));
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<Map<String, Object>> getCompanyProfile(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyProfile(id));
    }

    @GetMapping("/my-company")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Company> getMyCompany(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(companyService.getByEmployerId(extractUserId(userDetails)));
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Company> createOrUpdateCompany(
        @Valid @RequestBody CompanyRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(companyService.createOrUpdate(extractUserId(userDetails), request));
    }

    @PostMapping(value = "/{id}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Company> uploadLogo(
        @PathVariable Long id,
        @RequestParam("file") MultipartFile file
    ) throws IOException {
        return ResponseEntity.ok(companyService.uploadLogo(id, file));
    }

    private Long extractUserId(UserDetails userDetails) {
        return Long.parseLong(userDetails.getUsername());
    }
}
