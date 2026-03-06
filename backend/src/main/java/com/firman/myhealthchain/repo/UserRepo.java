package com.firman.myhealthchain.repo;

import com.firman.myhealthchain.model.Role;
import com.firman.myhealthchain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameAndRole(String username, Role role);

    boolean existsByUsername(String username);

    long countByOrganizationIdAndRole(Long organizationId, Role role);
}
