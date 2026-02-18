package com.firman.myhealthchain.service;

import com.firman.myhealthchain.dto.CreateRecordRequest;
import com.firman.myhealthchain.dto.MedicalRecordResponse;
import com.firman.myhealthchain.model.MedicalRecord;
import com.firman.myhealthchain.model.User;
import com.firman.myhealthchain.repo.MedicalRecordRepository;
import com.firman.myhealthchain.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class MedicalRecordService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    @Autowired
    private MedicalRecordRepository recordRepo;

    @Autowired
    private UserRepo userRepo;

    public MedicalRecordResponse createRecord(CreateRecordRequest request, String doctorUsername) {
        User doctor = userRepo.findByUsername(doctorUsername)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        String recordId = "REC-" + (10000 + ThreadLocalRandom.current().nextInt(90000));
        LocalDateTime now = LocalDateTime.now();

        // Compute SHA-256 hash of the record data
        String dataToHash = request.getPatientId() + request.getPatientName()
                + request.getDiagnosis() + request.getTreatment() + now.toString();
        String hash = sha256(dataToHash);

        MedicalRecord record = new MedicalRecord();
        record.setRecordId(recordId);
        record.setPatientId(request.getPatientId());
        record.setPatientName(request.getPatientName());
        record.setDoctorName(doctor.getDisplayName());
        record.setDiagnosis(request.getDiagnosis());
        record.setTreatment(request.getTreatment());
        record.setDate(now);
        record.setDbHash("0x" + hash);
        record.setChainHash("0x" + hash); // In production, this would come from the blockchain
        record.setDoctor(doctor);

        recordRepo.save(record);

        return toResponse(record);
    }

    public List<MedicalRecordResponse> getRecordsByPatientId(String patientId) {
        return recordRepo.findByPatientIdOrderByDateDesc(patientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private MedicalRecordResponse toResponse(MedicalRecord record) {
        return new MedicalRecordResponse(
                record.getRecordId(),
                record.getPatientName(),
                record.getDoctorName(),
                record.getDiagnosis(),
                record.getTreatment(),
                record.getDate().format(DATE_FMT),
                record.getDbHash(),
                record.getChainHash());
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
