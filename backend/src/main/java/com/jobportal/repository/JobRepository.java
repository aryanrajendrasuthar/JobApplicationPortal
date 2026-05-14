package com.jobportal.repository;

import com.jobportal.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByCompanyId(Long companyId);

    Page<Job> findByStatus(Job.JobStatus status, Pageable pageable);

    @Query("""
        SELECT j FROM Job j WHERE j.status = 'ACTIVE'
        AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
        AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))
        AND (:type IS NULL OR j.type = :type)
        AND (:salaryMin IS NULL OR j.salaryMin >= :salaryMin)
        AND (:salaryMax IS NULL OR j.salaryMax <= :salaryMax)
        AND (:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel)
        """)
    Page<Job> searchJobs(
        @Param("keyword") String keyword,
        @Param("location") String location,
        @Param("type") Job.JobType type,
        @Param("salaryMin") BigDecimal salaryMin,
        @Param("salaryMax") BigDecimal salaryMax,
        @Param("experienceLevel") String experienceLevel,
        Pageable pageable
    );

    @Query("SELECT j FROM Job j WHERE j.companyId IN :companyIds AND j.status = 'ACTIVE'")
    Page<Job> findByCompanyIds(@Param("companyIds") List<Long> companyIds, Pageable pageable);

    List<Job> findTop6ByStatusOrderByPostedAtDesc(Job.JobStatus status);
}
