package com.firman.myhealthchain.controller;

import com.firman.myhealthchain.dto.AuditLogResponse;
import com.firman.myhealthchain.dto.DashboardStatsResponse;
import com.firman.myhealthchain.model.UserPrincipal;
import com.firman.myhealthchain.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/org")
public class OrgAuditController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "7d") String range,
            @RequestParam(required = false) String doctorId,
            Authentication authentication) {

        Long orgId = getOrganizationId(authentication);
        if (orgId == null) {
            return ResponseEntity.ok(List.of());
        }

        List<AuditLogResponse> logs = auditLogService.getAuditLogs(orgId, action, status, range, doctorId);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(Authentication authentication) {

        Long orgId = getOrganizationId(authentication);
        if (orgId == null) {
            return ResponseEntity.ok(new DashboardStatsResponse(0, 0, 0, 0));
        }

        DashboardStatsResponse stats = auditLogService.getDashboardStats(orgId);
        return ResponseEntity.ok(stats);
    }

    private Long getOrganizationId(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return principal.getUser().getOrganizationId();
    }
}
