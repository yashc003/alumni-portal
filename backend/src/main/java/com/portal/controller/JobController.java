package com.portal.controller;

import com.portal.dto.JobPostDTO;
import com.portal.dto.JobRequest;
import com.portal.model.JobPost;
import com.portal.model.Role;
import com.portal.model.User;
import com.portal.repository.JobPostRepository;
import com.portal.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

/*
 * ============================================================
 * 💼 JobController.java
 * ============================================================
 * Handles creating and fetching job posts. Only Alumni and
 * Admins can post jobs, but anyone (Students included) can view them.
 * ============================================================
 */

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;

    public JobController(JobPostRepository jobPostRepository, UserRepository userRepository) {
        this.jobPostRepository = jobPostRepository;
        this.userRepository = userRepository;
    }

    // Get all jobs
    @GetMapping
    public List<JobPostDTO> getAllJobs() {
        return jobPostRepository.findAllByOrderByRelevanceScoreDescCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Post a new job
    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody JobRequest request, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.ROLE_STUDENT) {
            return ResponseEntity.status(403).body("Only Alumni and Admins can post jobs.");
        }

        JobPost job = new JobPost();
        job.setTitle(request.getTitle());
        job.setCompany(request.getCompany());
        job.setLocation(request.getLocation());
        job.setDescription(request.getDescription());
        job.setApplyLink(request.getApplyLink());
        job.setPostedBy(user);
        job.setRelevanceScore(100); // Manual Alumni posts get highest relevance

        jobPostRepository.save(job);
        
        return ResponseEntity.ok(mapToDTO(job));
    }

    private JobPostDTO mapToDTO(JobPost job) {
        JobPostDTO dto = new JobPostDTO();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setCompany(job.getCompany());
        dto.setLocation(job.getLocation());
        dto.setDescription(job.getDescription());
        dto.setApplyLink(job.getApplyLink());
        dto.setSource(job.getSource());
        dto.setExternalSourceUrl(job.getExternalSourceUrl());
        
        // Job Aggregation Engine Fields
        dto.setRelevanceScore(job.getRelevanceScore());
        dto.setIsReferralAvailable(job.getIsReferralAvailable());
        dto.setMinExperience(job.getMinExperience());
        dto.setMaxExperience(job.getMaxExperience());
        dto.setMatchedSkills(job.getMatchedSkills());
        dto.setMissingSkills(job.getMissingSkills());
        
        if (job.getPostedBy() != null) {
            dto.setPostedByFullName(job.getPostedBy().getFullName());
        } else {
            dto.setPostedByFullName("System");
        }
        
        dto.setCreatedAt(job.getCreatedAt());
        return dto;
    }
}
