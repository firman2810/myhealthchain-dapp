package com.firman.myhealthchain.controller;

import com.firman.myhealthchain.model.Organization;
import com.firman.myhealthchain.repo.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class OrganizationController {

    @Autowired
    private OrganizationRepository organizationRepo;

    /**
     * Public endpoint — returns all registered organizations for
     * the registration dropdown (doctors / auditors pick their org).
     */
    @GetMapping("/organizations")
    public ResponseEntity<List<Organization>> listOrganizations() {
        return ResponseEntity.ok(organizationRepo.findAll());
    }
}
