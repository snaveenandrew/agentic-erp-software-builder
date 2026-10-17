# Architecture Decision Record: Hybrid Multi-Tenant Storage Strategy

<!-- Standard: ASD-STE100 Compliant (<=20 words per procedural instruction, <=25 words per description). -->

## 1. Metadata
- **ADR ID:** ADR-001
- **Title:** Hybrid Firestore and Relational Ledger Storage Pattern
- **Status:** Approved
- **Deciders:** Solution Architect, Firebase Security and Data Agent
- **Date:** 2026-10-17
- **Traceability Link:** REQ-SCM-001

---

## 2. Context & Problem Statement
Enterprise ERP systems require real-time warehouse tracking and compliant financial ledgers. Operational teams demand sub-second dashboard refreshes. Financial auditors require double-entry transaction consistency.

---

## 3. Decision Drivers
- High-velocity warehouse updates require real-time listeners.
- Tenant isolation must prevent cross-customer data leakage.
- Financial journal balances must guarantee balanced debit and credit entries.
- Cloud deployment must scale with minimal idle hosting costs.

---

## 4. Considered Options
- Option 1: Monolithic Relational Database (Cloud SQL only)
- Option 2: Pure NoSQL Storage (Cloud Firestore only)
- Option 3: Hybrid Architecture (Firestore for operations and Data Connect for ledgers)

---

## 5. Decision Outcome
Chosen Option: Option 3 (Hybrid Architecture).

### Positive Consequences
- Real-time Firestore sync powers operational warehouse dispatch.
- Tenant isolation uses token claims at document paths.
- General ledger maintains immutable journal balance integrity.
- Client SDKs retain offline caching capabilities.

### Negative Consequences / Tradeoffs
- Cross-database synchronization requires idempotent Cloud Functions.
- Developers must maintain two data schemas.

---

## 6. Implementation & Security Guardrails
1. Partition all Firestore collections under the tenant path.
2. Verify token tenant identifiers in all security rules.
3. Validate total debits equal total credits before saving transactions.
4. Block wildcard rules in all deployment pipelines.
