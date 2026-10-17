# Agent Handoff Package Template

<!-- Standard: ASD-STE100 Compliant. Complete standalone package for cross-agent tasks. -->

## 1. Assignment Context
- **Handoff ID:** HND-`[SLICE-01]`-`[TASK-001]`
- **Timestamp:** `YYYY-MM-DDTHH:MM:SSZ`
- **From Agent:** `[Dispatching Agent, e.g., ERP Product Orchestrator]`
- **To Agent:** `[Receiving Agent, e.g., Frontend Agent]`
- **Assigned Slice:** `[e.g., Slice 1: Authentication & Trailer Gate In]`
- **Target Deadline:** `YYYY-MM-DD`

---

## 2. Objective & Scope
- **Core Objective:** `[State exact task goal in 1-2 direct sentences.]`
- **Scope Boundary:**
  - **In-Scope:** `[Explicit tasks to perform]`
  - **Out-of-Scope:** `[Work deferred to subsequent slices]`

---

## 3. Required Input Artifacts & Links
All agents must read from linked artifacts. Do not rely on chat history:
- **Requirement Spec:** `[docs/requirements/REQ-001.md]`
- **ERP Blueprint Excerpt:** `[docs/blueprint.json#entities.Trailer]`
- **UI Specification:** `[docs/design/UI-001.md]`
- **Security Rules Contract:** `[firestore.rules#lines-24-38]`

---

## 4. Acceptance Criteria & Pass Thresholds
1. Code passes local build and lint with 0 errors.
2. All 5 UI states implemented according to UI-001 checklist.
3. Unit and rules test coverage >= 90%.
4. Minimum Reward Score required to pass gate: `>= 0.90`.

---

## 5. Expected Output Deliverables
- **Branch Name:** `feature/[slice-1-trailer-checkin]`
- **Pull Request Link:** `PR #[12]`
- **Output Artifacts:** `[List created files and docs]`
- **Handoff Return State:** `[Ready for Review | Blocked]`
