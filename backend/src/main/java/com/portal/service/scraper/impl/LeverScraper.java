package com.portal.service.scraper.impl;

import com.portal.model.JobPost;
import com.portal.service.scraper.JobScraperStrategy;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class LeverScraper implements JobScraperStrategy {

    private final RestTemplate restTemplate;
    private final String BOARD_TOKEN = "figma"; // Using Netflix as an example

    public LeverScraper() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String getSourceName() {
        return "Lever";
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<JobPost> scrapeJobs() throws Exception {
        List<JobPost> jobs = new ArrayList<>();
        
        String url = "https://api.lever.co/v0/postings/" + BOARD_TOKEN + "?mode=json";
        
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            
            org.springframework.http.ResponseEntity<List> responseEntity = restTemplate.exchange(
                url, org.springframework.http.HttpMethod.GET, entity, List.class);
            List<Map<String, Object>> response = (List<Map<String, Object>>) responseEntity.getBody();
            if (response != null) {
                // Just grab the first 5 to not flood our DB
                for (int i = 0; i < Math.min(5, response.size()); i++) {
                    Map<String, Object> jobData = response.get(i);
                    
                    JobPost job = new JobPost();
                    job.setTitle((String) jobData.get("text"));
                    job.setCompany("Netflix (via Lever)");
                    
                    Map<String, Object> categories = (Map<String, Object>) jobData.get("categories");
                    job.setLocation(categories != null ? (String) categories.get("location") : "Remote");
                    
                    job.setApplyLink((String) jobData.get("hostedUrl"));
                    job.setExternalSourceUrl((String) jobData.get("hostedUrl"));
                    job.setSource(getSourceName());
                    job.setDescription((String) jobData.get("descriptionPlain"));
                    
                    jobs.add(job);
                }
            }
        } catch (Exception e) {
            throw new Exception("Lever API failed: " + e.getMessage());
        }
        
        return jobs;
    }
}
