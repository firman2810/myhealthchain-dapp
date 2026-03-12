# MyHealthChain — Blockchain-Based Healthcare Portal

<div align="center">

**A decentralized middleware prototype that bridges fragmented Hospital Information Systems (HIS), giving doctors and patients a unified, tamper-proof view of medical history.**

[![Status](https://img.shields.io/badge/status-in%20development-yellow?style=flat-square)](#-project-status)
[![License](https://img.shields.io/badge/license-academic%20%26%20research-blue?style=flat-square)](#-license)
[![Java](https://img.shields.io/badge/Java-25-orange?style=flat-square&logo=openjdk)](#)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](#)

</div>

---

## Project Description

Modern healthcare systems suffer from **siloed medical records** spread across different hospitals and clinics. A patient visiting multiple facilities often ends up with scattered, inaccessible data — making accurate diagnosis slower and riskier.

**MyHealthChain** solves this by creating a **decentralized index of patient medical history** using a hybrid storage model:

| Layer | What It Stores | Technology |
|-------|---------------|------------|
| **Off-chain** | Sensitive medical files (encrypted) | IPFS + AES-256 encryption |
| **On-chain** | Cryptographic hashes & access permissions | Ethereum smart contracts |
| **Backend** | Business logic, auth, audit trails | Spring Boot + PostgreSQL |

This architecture ensures **privacy**, **data integrity**, and full **traceability** — without ever putting raw patient data on a public blockchain.

---

## Architecture

<p align="center">
  <img src="https://www.pngall.com/wp-content/uploads/15/React-Logo-PNG-HD-Image.png" alt="React" height="55" />
  &nbsp;&nbsp;
  <img src="https://brandlogos.net/wp-content/uploads/2025/06/spring_boot-logo_brandlogos.net_dxzea.png" alt="Spring" height="50" />
  &nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Postgresql_elephant.svg/960px-Postgresql_elephant.svg.png" alt="Postgres" height="55" />
  &nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Ipfs-logo-1024-ice-text.png/960px-Ipfs-logo-1024-ice-text.png" alt="IPFS" height="50" />
  &nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/330px-Ethereum_logo_2014.svg.png" alt="Ethereum" height="55" />
</p>

The platform follows a **three-tier architecture**:

- **Frontend** — React SPA with role-based routing for Doctors, Patients, and Auditors
- **Backend** — Spring Boot REST API handling authentication, medical records, and audit logging
- **Data Layer** — PostgreSQL for relational data, IPFS for encrypted file storage, Ethereum for hash verification

---

## Technologies Used & Benefits

### Frontend
| Technology | Purpose | Benefit |
|-----------|---------|---------|
| **React 19** | UI framework | Component-driven, reactive interfaces |
| **TypeScript** | Type safety | Fewer runtime errors, better DX |
| **Vite** | Build tool | Lightning-fast HMR & builds |
| **React Router v7** | Client-side routing | Seamless SPA navigation with role guards |
| **Recharts** | Data visualization | Interactive charts for patient dashboards |
| **Lucide React** | Iconography | Consistent, modern icon system |

### Backend
| Technology | Purpose | Benefit |
|-----------|---------|---------|
| **Spring Boot 4** | Application framework | Production-ready REST APIs |
| **Spring Security + JWT** | Authentication & authorization | Stateless, token-based auth |
| **Spring Data JPA** | Data persistence | Simplified database operations |
| **PostgreSQL** | Relational database | Robust, ACID-compliant storage |
| **AspectJ (AOP)** | Cross-cutting concerns | Clean audit logging via annotations |
| **Lombok** | Boilerplate reduction | Cleaner, more readable model code |

### Blockchain & Storage
| Technology | Purpose | Benefit |
|-----------|---------|---------|
| **Ethereum** | Smart contracts | Immutable access control & hash verification |
| **IPFS** | Decentralized file storage | Censorship-resistant, content-addressed files |
| **AES-256** | File encryption | Military-grade encryption for medical data |
| **SHA-256** | Integrity hashing | Instant detection of unauthorized tampering |

---

## Key Features

- 🗂️ **Unified Medical Timeline** — Consolidates records from multiple hospitals into a single, chronological view
- 🔐 **Hybrid Storage Architecture** — AES-256 encrypted files on IPFS with on-chain hash verification
- 🔍 **Data Integrity Verification** — Automatic SHA-256 hash comparison detects unauthorized tampering
- 📊 **Patient Dashboard** — Visual analytics with interactive charts for health data trends
- 🕵️ **Auditor Portal** — Dedicated interface for compliance officers to review all access logs
- 🔑 **JWT Authentication** — Secure, stateless session management with role-based route guards

---

## Project Roadmap

| Phase | Milestone | Status |
|-------|----------|--------|
| **Phase 1** | Core backend — REST API, JWT auth, medical record CRUD | ✅ Complete |
| **Phase 2** | React frontend — Login, Dashboard, Consultation views | ✅ Complete |
| **Phase 3** | Role-based routing — Route guards, multi-role navigation | ✅ Complete |
| **Phase 4** | Auditor portal — Compliance logging & audit trail viewer | ✅ Complete |
| **Phase 5** | Ethereum smart contracts — On-chain hash storage & access control | 🔲 Planned |
| **Phase 6** | IPFS integration — Encrypted off-chain medical file storage | 🔲 Planned |


---

## Project Status

> **🟡 Active Development** — The project is under active development as an academic/research prototype.

**What's working:**
- ✅ Full JWT authentication flow with role-based access (Doctor, Patient, Auditor)
- ✅ Medical record creation and retrieval via REST API
- ✅ Interactive patient dashboard with data visualization
- ✅ Auditor portal for compliance review
- ✅ Client-side routing with role-specific route guards

**What's next:**
- 🔲 Ethereum smart contract deployment for on-chain hash verification
- 🔲 IPFS integration for decentralized file storage


---

## Getting Started

### Prerequisites
- **Java 25+** and **Maven**
- **Node.js 18+** and **npm**
- **PostgreSQL** database

### Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## License

This project is developed for **academic and research purposes**.
