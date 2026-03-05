package com.firman.myhealthchain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStatsResponse {
    private long doctorsCount;
    private long recordCreates7d;
    private long recordViews7d;
    private long deniedAttempts7d;
}
