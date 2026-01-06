package com.github.sleepystack.vaulta.controller;

import com.github.sleepystack.vaulta.dto.DashboardSummaryDTO;
import com.github.sleepystack.vaulta.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(Authentication authentication) {
        String userEmail = authentication.getName();
        DashboardSummaryDTO summary = dashboardService.getDashboardSummary(userEmail);
        return ResponseEntity.ok(summary);
    }
}