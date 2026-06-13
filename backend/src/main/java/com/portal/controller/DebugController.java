package com.portal.controller;

import com.portal.service.scraper.ScraperEngine;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    private final ScraperEngine scraperEngine;

    public DebugController(ScraperEngine scraperEngine) {
        this.scraperEngine = scraperEngine;
    }

    @GetMapping("/trigger-scrapers")
    public String triggerScrapers() {
        try {
            scraperEngine.runScrapers();
            return "Scrapers triggered successfully. Check console logs and notifications.";
        } catch (Exception e) {
            return "Failed to trigger scrapers: " + e.getMessage();
        }
    }
}
