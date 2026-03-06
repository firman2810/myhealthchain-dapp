package com.firman.myhealthchain.repo;

import com.firman.myhealthchain.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
}
