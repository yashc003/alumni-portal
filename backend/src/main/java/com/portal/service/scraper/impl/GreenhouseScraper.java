package com.portal.service.scraper.impl;

import com.portal.model.JobPost;
import com.portal.service.scraper.JobScraperStrategy;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GreenhouseScraper implements JobScraperStrategy {

    private final RestTemplate restTemplate;
    // We will scrape a well-known public company's board for demonstration
    private final String BOARD_TOKEN = "stripe"; 

    public GreenhouseScraper() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String getSourceName() {
        return "Greenhouse";
    }

    @Override
    public List<JobPost> scrapeJobs() throws Exception {
        List<JobPost> jobs = new ArrayList<>();
        
        String url = "https://boards-api.greenhouse.io/v1/boards/" + BOARD_TOKEN + "/jobs";
        
        try {
            Map response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("jobs")) {
                List<Map<String, Object>> jobList = (List<Map<String, Object>>) response.get("jobs");
                
                // Just grab the first 5 to not flood our DB
                for (int i = 0; i < Math.min(5, jobList.size()); i++) {
                    Map<String, Object> jobData = jobList.get(i);
                    
                    JobPost job = new JobPost();
                    job.setTitle((String) jobData.get("title"));
                    job.setCompany("Stripe (via Greenhouse)");
                    
                    Map<String, Object> locationData = (Map<String, Object>) jobData.get("location");
                    job.setLocation(locationData != null ? (String) locationData.get("name") : "Remote");
                    
                    job.setApplyLink((String) jobData.get("absolute_url"));
                    job.setExternalSourceUrl((String) jobData.get("absolute_url"));
                    job.setSource(getSourceName());
                    job.setDescription("View full details on Greenhouse.");
                    
                    jobs.add(job);
                }
            }
        } catch (Exception e) {
            throw new Exception("Greenhouse API failed: " + e.getMessage());
        }
        
        return jobs;
    }
}
