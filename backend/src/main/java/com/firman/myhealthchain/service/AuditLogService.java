package com.firman.myhealthchain.service;

import com.firman.myhealthchain.dto.AuditLogResponse;
import com.firman.myhealthchain.dto.DashboardStatsResponse;
import com.firman.myhealthchain.dto.DashboardStatsResponse.DailyCount;
import com.firman.myhealthchain.model.*;
import com.firman.myhealthchain.repo.AuditLogRepository;
import com.firman.myhealthchain.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

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
     * Get dashboard statistics for the given organization (past 7 days)
     * including a daily (or hourly for 24h) breakdown for charting.
     */
    public DashboardStatsResponse getDashboardStats(Long organizationId, String range) {
        boolean isHourly = "24h".equals(range);
        LocalDateTime since = isHourly
                ? LocalDateTime.now().minusHours(24)
                : LocalDateTime.now().minusDays(parseDays(range));

        long doctorsCount = userRepo.countByOrganizationIdAndRole(organizationId, Role.DOCTOR);
        long recordCreates = auditLogRepo.countByOrganizationIdAndActionAndTimestampAfter(
                organizationId, AuditAction.CREATE_RECORD, since);
        long recordViews = auditLogRepo.countByOrganizationIdAndActionAndTimestampAfter(
                organizationId, AuditAction.VIEW_RECORD, since);
        long deniedAttempts = auditLogRepo.countByOrganizationIdAndStatusAndTimestampAfter(
                organizationId, AuditStatus.DENIED, since);

        List<DailyCount> series = isHourly
                ? computeHourlySeries(organizationId, since)
                : computeDailySeries(organizationId, since, parseDays(range));

        return new DashboardStatsResponse(doctorsCount, recordCreates, recordViews,
                deniedAttempts, series);
    }

    /**
     * Aggregate audit logs into daily buckets for the chart.
     */
    private List<DailyCount> computeDailySeries(Long organizationId, LocalDateTime since, int numDays) {
        List<AuditLog> logs = auditLogRepo.findByOrgSince(organizationId, since);

        LocalDate today = LocalDate.now();
        Map<String, long[]> dayMap = new LinkedHashMap<>();
        for (int i = numDays - 1; i >= 0; i--) {
            String dateKey = today.minusDays(i).toString(); // "2026-03-01"
            dayMap.put(dateKey, new long[] { 0, 0, 0 });
        }

        for (AuditLog log : logs) {
            String dateKey = log.getTimestamp().toLocalDate().toString();
            long[] counts = dayMap.get(dateKey);
            if (counts == null)
                continue;
            bucketLog(counts, log);
        }

        return dayMap.entrySet().stream()
                .map(e -> new DailyCount(e.getKey(), e.getValue()[0], e.getValue()[1], e.getValue()[2]))
                .toList();
    }

    /**
     * Aggregate audit logs into hourly buckets for the 24h chart.
     * Date field format: "2026-03-06T14" (ISO date + hour).
     */
    private List<DailyCount> computeHourlySeries(Long organizationId, LocalDateTime since) {
        List<AuditLog> logs = auditLogRepo.findByOrgSince(organizationId, since);

        LocalDateTime now = LocalDateTime.now();
        Map<String, long[]> hourMap = new LinkedHashMap<>();
        for (int i = 23; i >= 0; i--) {
            LocalDateTime hour = now.minusHours(i).withMinute(0).withSecond(0).withNano(0);
            String key = hour.toString().substring(0, 13); // "2026-03-06T14"
            hourMap.put(key, new long[] { 0, 0, 0 });
        }

        for (AuditLog log : logs) {
            String key = log.getTimestamp().withMinute(0).withSecond(0).withNano(0)
                    .toString().substring(0, 13);
            long[] counts = hourMap.get(key);
            if (counts == null)
                continue;
            bucketLog(counts, log);
        }

        return hourMap.entrySet().stream()
                .map(e -> new DailyCount(e.getKey(), e.getValue()[0], e.getValue()[1], e.getValue()[2]))
                .toList();
    }

    /** Shared bucketing logic for a single log entry. */
    private void bucketLog(long[] counts, AuditLog log) {
        if (log.getAction() == AuditAction.CREATE_RECORD) {
            counts[0]++;
        } else if (log.getAction() == AuditAction.VIEW_RECORD) {
            counts[1]++;
        }
        if (log.getStatus() == AuditStatus.DENIED) {
            counts[2]++;
        }
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

    private int parseDays(String range) {
        if (range == null || range.isBlank())
            return 7;
        return switch (range) {
            case "24h" -> 1;
            case "30d" -> 30;
            default -> 7;
        };
    }
}
