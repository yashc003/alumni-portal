package com.portal.service.scraper.impl;

import com.portal.model.JobPost;
import com.portal.service.scraper.JobScraperStrategy;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LinkedInScraper implements JobScraperStrategy {

    @Override
    public String getSourceName() {
        return "LinkedIn";
    }

    @Override
    public List<JobPost> scrapeJobs() throws Exception {
        // We will intentionally throw an error here to simulate a broken Playwright setup.
        // This will trigger our Admin System Notifications!
        throw new Exception("Playwright browser binary not found. Missing proxy authentication.");
    }
}
