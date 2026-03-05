package com.firman.myhealthchain.repo;

import com.firman.myhealthchain.model.AuditAction;
import com.firman.myhealthchain.model.AuditLog;
import com.firman.myhealthchain.model.AuditStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

        @Query("SELECT a FROM AuditLog a WHERE a.organizationId = :orgId " +
                        "AND (:action IS NULL OR a.action = :action) " +
                        "AND (:status IS NULL OR a.status = :status) " +
                        "AND (:doctorId IS NULL OR a.doctorId = :doctorId) " +
                        "AND a.timestamp >= :since " +
                        "ORDER BY a.timestamp DESC")
        List<AuditLog> findByFilters(@Param("orgId") Long orgId,
                        @Param("action") AuditAction action,
                        @Param("status") AuditStatus status,
                        @Param("since") LocalDateTime since,
                        @Param("doctorId") String doctorId);

        long countByOrganizationIdAndActionAndTimestampAfter(Long organizationId, AuditAction action,
                        LocalDateTime since);

        long countByOrganizationIdAndStatusAndTimestampAfter(Long organizationId, AuditStatus status,
                        LocalDateTime since);
}
