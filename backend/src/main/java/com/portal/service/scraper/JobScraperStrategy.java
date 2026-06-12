package com.portal.service.scraper;

import com.portal.model.JobPost;

import java.util.List;

/**
 * The core Strategy interface for scraping jobs.
 * Each platform (Greenhouse, Lever, LinkedIn, etc.) implements this.
 */
public interface JobScraperStrategy {
    
    /**
     * @return The display name of the source (e.g., "Greenhouse", "LinkedIn")
     */
    String getSourceName();

    /**
     * @return A list of scraped jobs from the external source
     */
    List<JobPost> scrapeJobs() throws Exception;
}
