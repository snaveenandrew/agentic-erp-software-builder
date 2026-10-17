# Requirement Specification: Order-to-Cash & Inventory Allocation

<!-- Standard: ASD-STE100 Compliant (<=20 words per procedural instruction, <=25 words per description). -->

## 1. Metadata
- **Requirement ID:** REQ-SCM-001
- **Title:** Order-to-Cash and Real-Time Inventory Allocation
- **Domain Module:** Inventory & Supply Chain Management
- **Status:** Confirmed
- **Owner / Author:** Business Analyst
- **Created Date:** 2026-10-17
- **Decide-by Milestone:** Slice 1

---

## 2. Business Problem & User Story
### User Story
As an Operations Manager,  
I want real-time stock allocation during sales order confirmation,  
So that warehouse staff avoid order stockouts and inventory discrepancies.

### Context & Current Pain Point
Manual order processing creates stock allocation delays. Warehouse operators frequently confirm sales orders for depleted products.

---

## 3. Functional Requirements
1. The system shall validate stock availability before order confirmation.
2. The system shall deduct available stock immediately upon confirmation.
3. If available stock is insufficient, the system shall reject the confirmation.
4. The system shall record double-entry journal transactions for confirmed orders.
5. The system shall generate low-stock warning alerts when quantities breach thresholds.

---

## 4. Acceptance Criteria (Given-When-Then)

### Scenario 1: Normal Flow (Positive Case)
- **Given** an authenticated Warehouse Manager with available item inventory
- **When** the manager confirms a pending sales order
- **Then** the system shall transition order status to confirmed
- **And** the system shall deduct requested quantities from inventory.

### Scenario 2: Alternate Flow / Boundary Case
- **Given** an order quantity exactly equal to available warehouse stock
- **When** the manager confirms the order
- **Then** the system shall confirm the order successfully
- **And** the system shall set available stock to zero.

### Scenario 3: Negative / Insufficient Stock Case
- **Given** an order item requesting more than on-hand stock
- **When** the manager attempts confirmation
- **Then** the system shall reject confirmation with an error
- **And** keep current inventory levels unchanged.

---

## 5. Data & State Transitions
- **Primary Entity:** SalesOrder
- **Initial Status:** DRAFT
- **Valid Next States:** CONFIRMED, SHIPPED, INVOICED, CANCELLED
- **Prohibited States:** Cannot transition directly from DRAFT to SHIPPED

---

## 6. Non-Functional Constraints
- **Execution Tier:** Frontend UI and Cloud Functions Backend
- **Security Rule:** Enforce tenant isolation by checking authentication tokens
- **Performance Budget:** Mutation latency must not exceed 500 milliseconds
- **Traceability Link:** UX-SCM-001, TEST-SCM-001
