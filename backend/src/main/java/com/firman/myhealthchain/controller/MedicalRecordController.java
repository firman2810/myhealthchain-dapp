package com.firman.myhealthchain.controller;

import com.firman.myhealthchain.dto.CreateRecordRequest;
import com.firman.myhealthchain.dto.MedicalRecordResponse;
import com.firman.myhealthchain.service.MedicalRecordService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService recordService;

    @PostMapping("/records")
    public ResponseEntity<MedicalRecordResponse> createRecord(
            @Valid @RequestBody CreateRecordRequest request,
            Authentication authentication) {

        MedicalRecordResponse response = recordService.createRecord(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/patients/{patientId}/records")
    public ResponseEntity<List<MedicalRecordResponse>> getPatientRecords(
            @PathVariable String patientId,
            Authentication authentication) {

        // TODO: For DOCTOR role, verify approved access to this patient.
        // For now, any authenticated user can retrieve records.
        // PATIENT role should only access their own records (patientId == their
        // username/NRIC).

        List<MedicalRecordResponse> records = recordService.getRecordsByPatientId(patientId);
        return ResponseEntity.ok(records);
    }
}
