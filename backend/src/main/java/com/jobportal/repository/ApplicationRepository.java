package com.jobportal.repository;

import com.jobportal.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findBySeekerIdOrderByAppliedAtDesc(Long seekerId);

    Page<Application> findByJobId(Long jobId, Pageable pageable);

    Optional<Application> findByJobIdAndSeekerId(Long jobId, Long seekerId);

    boolean existsByJobIdAndSeekerId(Long jobId, Long seekerId);

    @Query("SELECT a FROM Application a WHERE a.jobId IN :jobIds ORDER BY a.appliedAt DESC")
    List<Application> findByJobIdIn(@Param("jobIds") List<Long> jobIds);

    long countByJobId(Long jobId);

    long countBySeekerId(Long seekerId);
}
