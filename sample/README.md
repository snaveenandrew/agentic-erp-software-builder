# ApexFlow ERP — Enterprise Sample Application

<!-- Standard: ASD-STE100 Compliant (<=20 words per procedural instruction, <=25 words per description). -->

## 1. Overview
ApexFlow ERP is a multi-tenant enterprise software application built using the **Agentic ERP Software Builder** factory framework.

It features:
- Real-time supply chain and inventory allocation.
- Order-to-Cash workflow lifecycle (`DRAFT` to `CONFIRMED` to `SHIPPED`).
- General ledger double-entry journal balance conservation ($\sum \text{Debits} == \sum \text{Credits}$).
- Role-based access control (`Admin`, `Warehouse`, `Finance`, `Sales`).
- The 5 mandatory UI states (`default`, `loading`, `empty`, `error`, `unauthorized`).

---

## 2. Directory Structure
```
sample/
├── docs/                 # ASD-STE100 specification deliverables
│   ├── REQ-SCM-001.md    # Requirements specification
│   ├── ADR-001.md        # Architecture decision record
│   ├── TEST-SCM-001.md   # Test case specification
│   └── UI-SCM-001.md     # 100% discrete UI checklist
├── firebase/             # Cloud data layer
│   ├── firestore.rules   # Multi-tenant security rules with RBAC
│   ├── firestore.indexes.json # Composite query indexes
│   └── seed_data.json    # Enterprise master seed data
├── public/               # Frontend single-page application
│   ├── index.html        # Modern dashboard markup with 5 states
│   ├── styles.css        # Enterprise glassmorphism styling
│   └── app.js            # Reactive store, state machine, and ledger
├── tests/                # Automated business logic test suite
│   └── erp_business_rules.test.js
├── firebase.json         # Firebase hosting & emulator configuration
├── package.json          # Project dependencies and test scripts
└── server.js             # Standalone local HTTP development server
```

---

## 3. Quick Start (Running Locally)

### Start the Local Server
From within the `sample` directory:
```bash
npm start
```
Or with Node directly:
```bash
node server.js
```
Open your browser at `http://localhost:3000`.

---

## 4. Running Verification Tests
Execute automated business invariant and security rules tests:
```bash
npm test
```

---

## 5. Security & Multi-Tenancy Architecture
- All operational collections are partitioned under `/tenants/{tenantId}/`.
- Security rules enforce `request.auth.token.tenantId == tenantId`.
- No wildcard read/write access is permitted.
- Financial ledger records are append-only.
