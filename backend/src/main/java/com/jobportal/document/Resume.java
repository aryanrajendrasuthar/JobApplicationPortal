package com.jobportal.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "resumes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Resume {

    @Id
    private String id;

    @Indexed(unique = true)
    private Long userId;

    private List<String> parsedSkills;
    private List<ExperienceEntry> experience;
    private List<EducationEntry> education;
    private String rawTextContent;
    private String resumeUrl;
    private LocalDateTime updatedAt;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ExperienceEntry {
        private String company;
        private String title;
        private String startDate;
        private String endDate;
        private String description;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class EducationEntry {
        private String institution;
        private String degree;
        private String field;
        private String graduationYear;
    }
}
