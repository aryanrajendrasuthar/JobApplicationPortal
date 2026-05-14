package com.jobportal.repository;

import com.jobportal.document.JobDescription;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobDescriptionRepository extends MongoRepository<JobDescription, String> {
    Optional<JobDescription> findByJobId(Long jobId);
}
