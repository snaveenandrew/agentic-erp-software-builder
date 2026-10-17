# UI Functionality Verification Checklist Template

<!-- Standard: ASD-STE100 Compliant. Exposes 100% discrete UI controls and 5 mandatory states. -->

## 1. Screen Metadata
- **Screen ID:** UI-`[MODULE]`-`[001]`
- **Screen Name:** `[e.g., Gate Inbound Processing Screen]`
- **Route Path:** `/app/operations/gate-in`
- **Assigned Slice:** `[Slice 1 / MVP]`
- **Reviewer:** `[Experience Reviewer]`
- **Review Date:** `YYYY-MM-DD`

---

## 2. Mandatory Five-State Checklist
Every screen must define and render these 5 states without runtime exceptions:

- [ ] **1. Default State:** All standard widgets, navigation headers, and action bars display properly.
- [ ] **2. Loading State:** Skeleton loader or accessible progress bar displays while network fetches data.
- [ ] **3. Empty State:** Clear call-to-action or instructional text displays when 0 records exist.
- [ ] **4. Error State:** Inline alert banner displays when backend rejects input; no unhandled console errors.
- [ ] **5. Unauthorized State:** Redirection or lock screen displays when user lacks the required role.

---

## 3. Discrete UI Functionalities Inventory

| Control ID | Element Type | Function / User Action | Validation & Constraints | Verified State | Findings / Defect ID |
| :--------- | :----------- | :--------------------- | :----------------------- | :------------- | :------------------- |
| `INP_TRAILER_ID` | Text Input | Enter trailer number | Required, uppercase, max 12 chars | [Pass / Fail] | None |
| `SEL_CARRIER` | Dropdown | Select assigned carrier | Populate list from Firestore | [Pass / Fail] | None |
| `BTN_SUBMIT` | Primary Button | Trigger gate check-in | Disabled if form is invalid | [Pass / Fail] | None |
| `LNK_CANCEL` | Text Link | Return to dashboard | Navigates without reload | [Pass / Fail] | None |
| `TBL_RECENT` | Data Table | Display recent entries | Page size 10, sortable columns | [Pass / Fail] | None |

---

## 4. Multi-Device & Accessibility Verification
- [ ] **Desktop (1920x1080):** Full layout without horizontal scroll.
- [ ] **Tablet (768x1024):** Sidebar collapses to drawer menu.
- [ ] **Mobile (375x667):** Touch targets >= 44x44px; single-column form.
- [ ] **Contrast & A11y:** WCAG 2.1 AA compliant text contrast ratio (>= 4.5:1).
- [ ] **Keyboard Navigation:** Tab key visits all inputs in logical order; Escape closes modals.
