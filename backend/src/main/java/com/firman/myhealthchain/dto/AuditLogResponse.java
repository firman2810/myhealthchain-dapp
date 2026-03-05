package com.firman.myhealthchain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private String timestamp;
    private String doctorName;
    private String doctorId;
    private String action;
    private String patientRef;
    private String status;
}
