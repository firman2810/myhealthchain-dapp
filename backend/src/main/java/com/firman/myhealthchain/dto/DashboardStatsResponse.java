package com.firman.myhealthchain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DashboardStatsResponse {
    private long doctorsCount;
    private long recordCreates7d;
    private long recordViews7d;
    private long deniedAttempts7d;
    private List<DailyCount> dailySeries;

    /** Convenience constructor without daily series (backward compat) */
    public DashboardStatsResponse(long doctorsCount, long recordCreates7d,
            long recordViews7d, long deniedAttempts7d) {
        this(doctorsCount, recordCreates7d, recordViews7d, deniedAttempts7d, List.of());
    }

    @Data
    @AllArgsConstructor
    public static class DailyCount {
        private String date; // "2026-03-01"
        private long creates;
        private long views;
        private long denied;
    }
}
