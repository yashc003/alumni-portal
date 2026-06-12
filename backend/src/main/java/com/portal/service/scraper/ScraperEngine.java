package com.portal.service.scraper;

import com.portal.model.JobPost;
import com.portal.model.SystemNotification;
import com.portal.repository.JobPostRepository;
import com.portal.repository.NotificationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScraperEngine {

    private final List<JobScraperStrategy> scrapers;
    private final JobPostRepository jobPostRepository;
    private final NotificationRepository notificationRepository;

    public ScraperEngine(List<JobScraperStrategy> scrapers, 
                         JobPostRepository jobPostRepository, 
                         NotificationRepository notificationRepository) {
        this.scrapers = scrapers;
        this.jobPostRepository = jobPostRepository;
        this.notificationRepository = notificationRepository;
    }

    // Run every 3 hours (10,800,000 ms)
    @Scheduled(fixedRate = 10800000)
    public void runScrapers() {
        System.out.println("🚀 Starting Job Scraper Engine...");

        for (JobScraperStrategy scraper : scrapers) {
            try {
                System.out.println("🤖 Running scraper: " + scraper.getSourceName());
                List<JobPost> newJobs = scraper.scrapeJobs();
                
                // Filter out jobs we already have
                List<JobPost> uniqueJobs = newJobs.stream()
                        .filter(job -> job.getExternalSourceUrl() != null && !jobPostRepository.existsByExternalSourceUrl(job.getExternalSourceUrl()))
                        .toList();

                if (!uniqueJobs.isEmpty()) {
                    jobPostRepository.saveAll(uniqueJobs);
                    System.out.println("✅ " + scraper.getSourceName() + " scraped " + uniqueJobs.size() + " new jobs.");
                } else {
                    System.out.println("⏭️ " + scraper.getSourceName() + " found 0 new jobs.");
                }

            } catch (Exception e) {
                System.err.println("❌ Scraper Failed: " + scraper.getSourceName());
                
                // Create an Admin Notification
                SystemNotification alert = new SystemNotification();
                alert.setSource(scraper.getSourceName());
                alert.setMessage("Scraper failed: " + e.getMessage());
                notificationRepository.save(alert);
            }
        }
        
        System.out.println("🏁 Scraper Engine Finished.");
    }
}
