package com.firman.myhealthchain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateRecordRequest {

    @NotBlank(message = "Patient ID (NRIC) is required")
    private String patientId;

    @NotBlank(message = "Patient name is required")
    private String patientName;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    @NotBlank(message = "Treatment is required")
    private String treatment;
}
