# Requirement Specification Template

<!-- Standard: ASD-STE100 Compliant (<=20 words per procedural instruction, <=25 words per description, active voice). -->

## 1. Metadata
- **Requirement ID:** REQ-`[DOMAIN]`-`[001]`
- **Title:** `[Brief Descriptive Title]`
- **Domain Module:** `[e.g., Inventory / TMS / YMS / Finance / HR]`
- **Status:** `[Confirmed | Assumed | Deferred | Open-blocking]`
- **Owner / Author:** `[Business Analyst]`
- **Created Date:** `YYYY-MM-DD`
- **Decide-by Milestone:** `[Sprint 0 | Slice 1 | Slice 2 | Deferred]`

---

## 2. Business Problem & User Story
### User Story
As a `[user role]`,  
I want to `[execute specific task]`,  
So that `[achieve measurable business outcome]`.

### Context & Current Pain Point
`[State context in 1-2 declarative sentences. Eliminate conversational padding.]`

---

## 3. Functional Requirements
1. The system shall `[atomic functional rule 1]`.
2. The system shall `[atomic functional rule 2]`.
3. If `[condition]`, then the system shall `[atomic exception behavior]`.

---

## 4. Acceptance Criteria (Given-When-Then)

### Scenario 1: Normal Flow (Positive Case)
- **Given** `[precondition state and user role]`
- **When** the user `[executes action with input data]`
- **Then** the system shall `[expected outcome and state change]`
- **And** the system shall log `[audit trail entry]`.

### Scenario 2: Alternate Flow / Boundary Case
- **Given** `[boundary precondition, e.g., zero balance, max limits]`
- **When** the user `[submits input]`
- **Then** the system shall `[expected boundary handling]`.

### Scenario 3: Negative / Permission Rejection Case
- **Given** an unauthorized user or invalid input `[specific error payload]`
- **When** the request arrives at the backend function
- **Then** the system shall reject the transaction with status code `[e.g., 403 / 400]`
- **And** display error message: `"..."`.

---

## 5. Data & State Transitions
- **Primary Entity:** `[e.g., Shipment / Trailer / Invoice]`
- **Initial Status:** `[e.g., DRAFT]`
- **Valid Next States:** `[e.g., SUBMITTED, CANCELLED]`
- **Prohibited States:** `[e.g., Cannot transition directly from DRAFT to DELIVERED]`

---

## 6. Non-Functional Constraints
- **Execution Tier:** `[Frontend | Cloud Functions Backend]`
- **Security Rule:** `[Firestore security rule condition / Data Connect policy]`
- **Performance Budget:** Latency <= `[500ms]`, Cold start <= `[1500ms]`
- **Traceability Link:** Design: `[UX-001]`, Test: `[TEST-001]`
