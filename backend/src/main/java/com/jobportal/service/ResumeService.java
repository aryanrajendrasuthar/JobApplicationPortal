package com.jobportal.service;

import com.jobportal.document.Resume;
import com.jobportal.entity.User;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.ResumeRepository;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;

    private static final List<String> KNOWN_SKILLS = Arrays.asList(
        "java", "python", "javascript", "typescript", "react", "angular", "vue",
        "spring", "spring boot", "node.js", "express", "django", "flask", "fastapi",
        "postgresql", "mysql", "mongodb", "redis", "kafka", "docker", "kubernetes",
        "aws", "azure", "gcp", "rest api", "graphql", "git", "ci/cd", "microservices",
        "html", "css", "tailwind", "sql", "nosql", "machine learning", "deep learning",
        "tensorflow", "pytorch", "pandas", "numpy", "linux", "bash", "terraform"
    );

    public Resume uploadAndParseResume(MultipartFile file, Long userId) throws IOException {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        String resumeUrl = s3Service.uploadResume(file, userId);
        user.setResumeUrl(resumeUrl);

        String rawText = extractTextFromPdf(file);
        List<String> skills = parseSkillsFromText(rawText);

        if (!skills.isEmpty() && (user.getSkills() == null || user.getSkills().isEmpty())) {
            user.setSkills(skills);
        }
        userRepository.save(user);

        Resume resume = resumeRepository.findByUserId(userId).orElse(new Resume());
        resume.setUserId(userId);
        resume.setResumeUrl(resumeUrl);
        resume.setRawTextContent(rawText);
        resume.setParsedSkills(skills);
        resume.setUpdatedAt(LocalDateTime.now());

        return resumeRepository.save(resume);
    }

    public Optional<Resume> getResumeByUserId(Long userId) {
        return resumeRepository.findByUserId(userId);
    }

    private String extractTextFromPdf(MultipartFile file) {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (IOException e) {
            log.warn("PDF text extraction failed: {}", e.getMessage());
            return "";
        }
    }

    private List<String> parseSkillsFromText(String text) {
        if (text == null || text.isBlank()) return new ArrayList<>();
        String lower = text.toLowerCase();
        return KNOWN_SKILLS.stream()
            .filter(skill -> {
                Pattern pattern = Pattern.compile("\\b" + Pattern.quote(skill) + "\\b");
                return pattern.matcher(lower).find();
            })
            .map(s -> Arrays.stream(s.split("\\s+"))
                .map(w -> Character.toUpperCase(w.charAt(0)) + w.substring(1))
                .collect(Collectors.joining(" ")))
            .collect(Collectors.toList());
    }
}
