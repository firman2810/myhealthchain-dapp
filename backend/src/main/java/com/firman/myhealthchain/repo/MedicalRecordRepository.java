package com.firman.myhealthchain.repo;

import com.firman.myhealthchain.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientIdOrderByDateDesc(String patientId);
}
