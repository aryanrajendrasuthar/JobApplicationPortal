package com.jobportal.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.List;

@Document(collection = "job_descriptions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobDescription {

    @Id
    private String id;

    @Indexed(unique = true)
    private Long jobId;

    private String fullDescription;
    private String benefits;
    private List<String> requirements;
    private List<String> responsibilities;
    private String aboutRole;
}
