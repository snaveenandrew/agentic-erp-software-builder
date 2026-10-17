# Agentic Goal & Reward Scoring System Reference

<!-- Reference guide for quantifiable agent scoring, penalty formulas, and gate clearance metrics. -->

## 1. Mathematical Formulation

Every agent output $O_a$ for agent $a$ receives a scalar score $S \in [0.0, 1.0]$:

$$S = \max\left(0.0, 1.0 - \sum P_i\right) \times \mathbb{I}_{\text{Safety}}$$

Where:
- $1.0$ is the baseline score achieved when all required deliverables are present.
- $P_i$ represents the penalty deduction for omission or defect $i$.
- $\mathbb{I}_{\text{Safety}} \in \{0, 1\}$ is the safety indicator function. It equals $0$ if a critical failure occurs.

---

## 2. Standardized Penalty Deductions ($P_i$)

| Defect Category | Deficit Description | Deduction ($P_i$) |
| :-------------- | :------------------ | :---------------- |
| **Requirements** | Missing acceptance scenario or untested edge case | `-0.15` |
| **UI Inventory** | Unitemized interactive element or missing state (out of 5 states) | `-0.20` |
| **Database** | Unindexed Firestore query or missing composite index | `-0.25` |
| **Code Review** | PR with unaddressed high-severity comment or code duplication | `-0.30` |
| **ASD-STE100** | Sentence exceeding word limit (>20/25 words) or ambiguous synonym | `-0.05` |
| **Performance** | API execution exceeding budget (>500ms API / >1500ms cold start) | `-0.20` |
| **Documentation**| Missing requirement traceability link or broken artifact reference | `-0.10` |

---

## 3. Safety Resets ($\mathbb{I}_{\text{Safety}} = 0$)
Any occurrence of the following triggers an immediate reset to $S = 0.0$:
1. Exposure of raw API keys, private keys, or passwords.
2. Wildcard security rules (`allow read, write: if true;`).
3. Broken build or unhandled promise rejection in CI.
4. Untested modification to production database collections.

---

## 4. Gate Clearance Thresholds

| Delivery Phase | Responsible Agents | Required Passing Threshold ($S$) |
| :------------- | :----------------- | :------------------------------- |
| **Scope Approval** | Discovery Facilitator, BA, Domain Analyst | $S \ge 0.90$ |
| **Design Baseline** | Solution Architect, UX/UI, Security, Data | $S \ge 0.95$ (Security requires $1.0$) |
| **Slice Pull Request** | Frontend, Backend, Code Reviewer | $S = 1.0$ (Zero blocking review comments) |
| **Slice Acceptance** | QA Agent, Experience Reviewer | $S \ge 0.95$ |
| **Release Gate** | Platform and Release Agent, Orchestrator | $S = 1.0$ (All tests passing, zero P0/P1 defects) |

---

## 5. Escalation Rule
If an agent fails to achieve $S \ge \text{Threshold}$ after **3 consecutive revision cycles**, the Orchestrator pauses the automated loop and flags the issue for human review with a specific deficiency report.
