# Test Case Specification: SCM Inventory Allocation and Order Confirmation

<!-- Standard: ASD-STE100 Compliant (<=20 words per procedural instruction, <=25 words per description). -->

## 1. Test Metadata
- **Test ID:** TEST-SCM-001
- **Requirement Traceability:** REQ-SCM-001
- **Target Tier:** Unit, Integration, and Security Emulator
- **Execution Mode:** Automated CI
- **Author:** QA Agent
- **Created Date:** 2026-10-17

---

## 2. Test Objectives
Verify correct inventory stock reduction upon sales order confirmation. Ensure transaction aborts if requested quantity exceeds available stock. Verify double-entry ledger balance conservation.

---

## 3. Test Cases Inventory

### Test Case 1: Positive Inventory Allocation
- **Precondition:** Item SKU-100 has 50 units in stock.
- **Execution Step 1:** Submit confirmation for sales order requesting 10 units.
- **Execution Step 2:** Query warehouse inventory balance.
- **Expected Result:** Remaining stock equals 40 units. Order status becomes confirmed.

### Test Case 2: Insufficient Inventory Rejection
- **Precondition:** Item SKU-101 has 5 units in stock.
- **Execution Step 1:** Submit confirmation for sales order requesting 12 units.
- **Expected Result:** System returns error code 400. Stock remains at 5 units.

### Test Case 3: Ledger Journal Balance Conservation
- **Precondition:** Sales order confirmed for total amount $1,500.00.
- **Execution Step 1:** Process journal entry generation.
- **Expected Result:** Debit Accounts Receivable $1,500.00. Credit Sales Revenue $1,500.00. Total difference equals zero.

### Test Case 4: Multi-Tenant Security Isolation
- **Precondition:** User authenticated under Tenant A.
- **Execution Step 1:** Query orders belonging to Tenant B.
- **Expected Result:** Firestore security rule denies request with permission-denied error.
