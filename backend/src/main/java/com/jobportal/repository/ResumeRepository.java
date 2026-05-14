package com.jobportal.repository;

import com.jobportal.document.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResumeRepository extends MongoRepository<Resume, String> {
    Optional<Resume> findByUserId(Long userId);
}
