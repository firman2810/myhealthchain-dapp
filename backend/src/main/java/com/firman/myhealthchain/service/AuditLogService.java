package com.firman.myhealthchain.service;

import com.firman.myhealthchain.dto.AuditLogResponse;
import com.firman.myhealthchain.dto.DashboardStatsResponse;
import com.firman.myhealthchain.model.*;
import com.firman.myhealthchain.repo.AuditLogRepository;
import com.firman.myhealthchain.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepo;

    @Autowired
    private UserRepo userRepo;

    /**
     * Query audit logs for a given organization with optional filters.
     */
    public List<AuditLogResponse> getAuditLogs(Long organizationId, String action, String status,
            String range, String doctorId) {
        AuditAction actionEnum = parseAction(action);
        AuditStatus statusEnum = parseStatus(status);
        LocalDateTime since = parseSince(range);

        return auditLogRepo.findByFilters(organizationId, actionEnum, statusEnum, since, doctorId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Get dashboard statistics for the given organization (past 7 days).
     */
    public DashboardStatsResponse getDashboardStats(Long organizationId) {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        long doctorsCount = userRepo.countByOrganizationIdAndRole(organizationId, Role.DOCTOR);
        long recordCreates7d = auditLogRepo.countByOrganizationIdAndActionAndTimestampAfter(
                organizationId, AuditAction.CREATE_RECORD, sevenDaysAgo);
        long recordViews7d = auditLogRepo.countByOrganizationIdAndActionAndTimestampAfter(
                organizationId, AuditAction.VIEW_RECORD, sevenDaysAgo);
        long deniedAttempts7d = auditLogRepo.countByOrganizationIdAndStatusAndTimestampAfter(
                organizationId, AuditStatus.DENIED, sevenDaysAgo);

        return new DashboardStatsResponse(doctorsCount, recordCreates7d, recordViews7d, deniedAttempts7d);
    }

    // ── helpers ──

    private AuditLogResponse toResponse(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getTimestamp().toString(),
                log.getDoctorName(),
                log.getDoctorId(),
                log.getAction().name(),
                log.getPatientRef(),
                log.getStatus().name());
    }

    private AuditAction parseAction(String action) {
        if (action == null || action.isBlank() || "ALL".equalsIgnoreCase(action))
            return null;
        try {
            return AuditAction.valueOf(action);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private AuditStatus parseStatus(String status) {
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status))
            return null;
        try {
            return AuditStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private LocalDateTime parseSince(String range) {
        if (range == null || range.isBlank())
            range = "7d";
        return switch (range) {
            case "24h" -> LocalDateTime.now().minusHours(24);
            case "30d" -> LocalDateTime.now().minusDays(30);
            default -> LocalDateTime.now().minusDays(7);
        };
    }
}
