package com.portal.service.scraper;

import com.portal.model.JobPost;
import com.portal.model.SystemNotification;
import com.portal.repository.JobPostRepository;
import com.portal.repository.NotificationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

import com.portal.model.SourceHealth;
import com.portal.repository.SourceHealthRepository;
import java.util.concurrent.TimeUnit;
import java.time.LocalDateTime;

@Service
public class ScraperEngine {

    private final List<JobScraperStrategy> scrapers;
    private final JobPostRepository jobPostRepository;
    private final NotificationRepository notificationRepository;
    private final JobAggregationEngine jobAggregationEngine;
    private final SourceHealthRepository sourceHealthRepository;

    public ScraperEngine(List<JobScraperStrategy> scrapers, 
                         JobPostRepository jobPostRepository, 
                         NotificationRepository notificationRepository,
                         JobAggregationEngine jobAggregationEngine,
                         SourceHealthRepository sourceHealthRepository) {
        this.scrapers = scrapers;
        this.jobPostRepository = jobPostRepository;
        this.notificationRepository = notificationRepository;
        this.jobAggregationEngine = jobAggregationEngine;
        this.sourceHealthRepository = sourceHealthRepository;
    }

    @Scheduled(fixedDelayString = "${scraper.interval.hours:3}", timeUnit = TimeUnit.HOURS)
    public void runScrapers() {
        System.out.println("🚀 Starting Job Scraper Engine...");

        for (JobScraperStrategy scraper : scrapers) {
            String sourceName = scraper.getSourceName();
            SourceHealth health = sourceHealthRepository.findBySourceName(sourceName)
                    .orElseGet(() -> {
                        SourceHealth sh = new SourceHealth();
                        sh.setSourceName(sourceName);
                        return sh;
                    });
            
            health.setLastRun(LocalDateTime.now());

            try {
                System.out.println("🤖 Running scraper: " + sourceName);
                List<JobPost> rawJobs = scraper.scrapeJobs();
                health.setJobsFetched(health.getJobsFetched() + rawJobs.size());
                
                // Pass through Job Aggregation Engine
                List<JobPost> filteredJobs = jobAggregationEngine.processAndFilter(rawJobs);
                
                // Calculate metrics
                int rejected = rawJobs.size() - filteredJobs.size(); // Approximation of rejected + deduplicated
                health.setJobsRejected(health.getJobsRejected() + rejected);
                
                if (!filteredJobs.isEmpty()) {
                    jobPostRepository.saveAll(filteredJobs);
                    System.out.println("✅ " + sourceName + " saved " + filteredJobs.size() + " new jobs after filtering.");
                } else {
                    System.out.println("⏭️ " + sourceName + " yielded 0 valid new jobs.");
                }

                health.setStatus("HEALTHY");
                health.setLastSuccess(LocalDateTime.now());

            } catch (Exception e) {
                System.err.println("❌ Scraper Failed: " + sourceName);
                
                health.setStatus("FAILING");
                health.setFailureCount(health.getFailureCount() + 1);

                // Create an Admin Notification
                SystemNotification alert = new SystemNotification();
                alert.setSource(sourceName);
                alert.setMessage("Scraper failed: " + e.getMessage());
                notificationRepository.save(alert);
            }

            sourceHealthRepository.save(health);
        }
        
        System.out.println("🏁 Scraper Engine Finished.");
    }
}
