# Architecture Decision Record (ADR) Template

<!-- Standard: ASD-STE100 Compliant. Keep rationale concise, factual, and direct. -->

## 1. Title & Status
- **ADR ID:** ADR-`[001]`
- **Title:** `[Decision Title, e.g., Choose Cloud Firestore for Operational Yard Inventory]`
- **Status:** `[Proposed | Accepted | Superseded | Deprecated]`
- **Date:** `YYYY-MM-DD`
- **Decider / Owner:** `[Solution Architect]`
- **Impacted Components:** `[Frontend | Cloud Functions | Firestore | Data Connect | Cloud Storage]`

---

## 2. Context & Problem Statement
`[Describe the problem, requirements, and constraints in 2-3 direct sentences. Specify why a decision is necessary.]`

---

## 3. Evaluated Options

### Option 1: `[Primary Option, e.g., Cloud Firestore]`
- **Description:** `[Brief architectural summary]`
- **Advantages:**
  - `[Advantage 1]`
  - `[Advantage 2]`
- **Disadvantages & Cost Impact:**
  - `[Drawback 1]`
  - `[Cost factor, e.g., Read/write billing scale]`

### Option 2: `[Alternative Option, e.g., Firebase Data Connect with Cloud SQL PostgreSQL]`
- **Description:** `[Brief architectural summary]`
- **Advantages:**
  - `[Advantage 1]`
- **Disadvantages & Cost Impact:**
  - `[Drawback 1]`

---

## 4. Decision Outcome & Rationale
- **Chosen Option:** `[Option 1 | Option 2]`
- **Primary Justification:**
  1. `[Core business or performance reason]`
  2. `[Security or compliance alignment]`
  3. `[Operational simplicity or Firebase tooling synergy]`

---

## 5. Consequences & Tradeoffs
- **Positive Impacts:**
  - `[Benefit 1]`
- **Negative Impacts / Mitigations:**
  - `[Risk 1: State mitigation, e.g., add composite indexes to prevent high read costs]`
- **Reversibility:** `[High | Medium | Low - describe migration path if reversed]`
