package com.firman.myhealthchain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MedicalRecordResponse {
    private String id;
    private String patientName;
    private String doctorName;
    private String diagnosis;
    private String treatment;
    private String date;
    private String dbHash;
    private String chainHash;
}
