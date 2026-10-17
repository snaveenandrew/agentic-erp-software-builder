# QA Test Case Specification Template

<!-- Standard: ASD-STE100 Compliant. Imperative actions, concrete test inputs, quantifiable assertions. -->

## 1. Test Metadata
- **Test Case ID:** TC-`[DOMAIN]`-`[001]`
- **Requirement ID:** REQ-`[DOMAIN]`-`[001]`
- **Test Type:** `[Unit | Security Rules Emulator | Integration | End-to-End | Visual Regression]`
- **Execution Tier:** `[Automated CI | Manual UAT]`
- **Priority:** `[P0 (Blocker) | P1 (High) | P2 (Medium)]`
- **Author:** `[QA Agent]`

---

## 2. Test Objectives & Preconditions
- **Objective:** Verify that `[specific capability behaves as expected under specified conditions]`.
- **Preconditions:**
  1. Test user authenticated with role `[e.g., YardManager]`.
  2. Test entity exists in database with status `[e.g., SCHEDULED]`.
  3. Firebase Emulator Suite running locally or staging environment active.

---

## 3. Test Steps & Inputs

| Step | Action (Imperative Verb) | Input Data / Payload | Expected System Result |
| :--- | :----------------------- | :------------------- | :--------------------- |
| 1 | Navigate to page | `/app/yard/checkin` | Page renders with loading state resolved in < 800ms. |
| 2 | Enter trailer identifier | `TR-99824` | Field validates format matching `^[A-Z]{2}-[0-9]{5}$`. |
| 3 | Click "Submit Gate In" button | Click trigger | Button shows disabled state with spinner. |
| 4 | Assert database change | Inspect Firestore doc | Status updates to `CHECKED_IN`; timestamp is current. |

---

## 4. Post-Conditions & Verification Assertions
- **Document Path:** `yards/{yardId}/trailers/{trailerId}`
- **Security Rule Check:** Confirm non-manager cannot execute write (returns `PERMISSION_DENIED`).
- **Audit Trail:** Confirm entry added to `audit_logs` collection.
- **Pass/Fail Criteria:** All 4 steps pass with zero console errors and 0 unhandled promise rejections.
