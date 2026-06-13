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
    @SuppressWarnings("unchecked")
    public List<JobPost> scrapeJobs() throws Exception {
        List<JobPost> jobs = new ArrayList<>();
        
        String url = "https://boards-api.greenhouse.io/v1/boards/" + BOARD_TOKEN + "/jobs";
        
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            
            org.springframework.http.ResponseEntity<Map> responseEntity = restTemplate.exchange(
                url, org.springframework.http.HttpMethod.GET, entity, Map.class);
            Map<String, Object> response = responseEntity.getBody();
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
