package com.portal.controller;

import com.portal.model.SourceHealth;
import com.portal.repository.SourceHealthRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final SourceHealthRepository sourceHealthRepository;

    public AdminDashboardController(SourceHealthRepository sourceHealthRepository) {
        this.sourceHealthRepository = sourceHealthRepository;
    }

    @GetMapping("/source-health")
    public ResponseEntity<List<SourceHealth>> getSourceHealth() {
        return ResponseEntity.ok(sourceHealthRepository.findAll());
    }
}
