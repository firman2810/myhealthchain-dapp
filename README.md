# 🩺 MyHealthChain

**MyHealthChain** is a blockchain-based middleware designed to bridge fragmented legacy **Hospital Information Systems (HIS)**.  
It provides a unified and secure portal for doctors and patients to access medical history while ensuring data integrity through decentralized technology.

---

## 📌 Overview

Modern healthcare systems often suffer from **siloed medical records** across different hospitals.  
MyHealthChain addresses this issue by creating a **decentralized index of patient medical history**.

The platform uses a **hybrid storage model**:
- **Sensitive medical files** are stored off-chain on **IPFS**
- **Cryptographic hashes and access permissions** are managed on-chain using **Ethereum smart contracts**

This approach ensures **privacy, integrity, and traceability** of medical data.

---

## ✨ Key Features

- **Unified Medical Timeline**  
  Consolidates patient records from multiple hospitals into a single, chronological view.

- **Hybrid Storage Architecture**  
  AES-256 encrypted medical files stored on IPFS with on-chain hash verification.

- **Two-Layer Role-Based Access Control (RBAC)**  
  Medical data access requires:
  1. Doctor’s request  
  2. Medical Administrator’s approval

- **Data Integrity Verification**  
  Automatic SHA-256 hash comparison to detect unauthorized data tampering.

---

## 🛠️ Tech Stack

### Frontend
- React.js  
- Tailwind CSS  
- Ethers.js  

### Backend
- Java  
- Spring Boot  
- Hibernate  

### Database
- MySQL (Metadata and User Roles)

### Blockchain
- Solidity (Smart Contracts)  
- Hardhat / Ganache  

### Storage
- IPFS (InterPlanetary File System)

---

## 🔒 Security Considerations

- Medical files are **never stored directly on-chain**
- All sensitive data is encrypted using **AES-256**
- Blockchain is used only for **verification, permissions, and auditability**

---

## 📜 License

This project is developed for academic and research purposes.