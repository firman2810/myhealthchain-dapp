package com.firman.myhealthchain.controller;

import com.firman.myhealthchain.model.Role;
import com.firman.myhealthchain.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/patients")
public class PatientLookupController {

    @Autowired
    private UserRepo userRepo;

    /**
     * Lookup a registered patient by their NRIC (username).
     * Returns { id, displayName } or 404 if not found.
     * Auth: DOCTOR only (enforced by SecurityConfig).
     */
    @GetMapping("/lookup")
    public ResponseEntity<?> lookupPatient(@RequestParam String identifier) {
        return userRepo.findByUsernameAndRole(identifier.trim(), Role.PATIENT)
                .map(patient -> ResponseEntity.ok(Map.of(
                        "id", patient.getId(),
                        "displayName", patient.getDisplayName())))
                .orElse(ResponseEntity.notFound().build());
    }
}
