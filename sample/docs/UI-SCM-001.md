# UI Functionality Verification Checklist: SCM Real-Time Dashboard

<!-- Standard: ASD-STE100 Compliant. Exposes 100% discrete UI controls and 5 mandatory states. -->

## 1. Screen Metadata
- **Screen ID:** UI-SCM-001
- **Screen Name:** Supply Chain and Order-to-Cash Executive Dashboard
- **Route Path:** `/sample/public/index.html`
- **Assigned Slice:** Slice 1 (MVP)
- **Reviewer:** Experience Reviewer
- **Review Date:** 2026-10-17

---

## 2. Mandatory Five-State Checklist
Every screen in the ERP slice implements the five mandatory states:

- [x] **1. Default State:** Navigation header, KPI cards, interactive tables, and order workflows render with live data.
- [x] **2. Loading State:** Shimmer skeleton containers render when data fetch is active.
- [x] **3. Empty State:** Clear call-to-action button displays when zero inventory records or orders exist.
- [x] **4. Error State:** Inline error toast displays when order confirmation fails or invalid inputs exist.
- [x] **5. Unauthorized State:** Full-screen lock overlay blocks sensitive views when users lack required roles.

---

## 3. Discrete UI Functionalities Inventory

| Control ID | Element Type | Function / User Action | Validation & Constraints | Verified State |
| :--------- | :----------- | :--------------------- | :----------------------- | :------------- |
| `BTN_ROLE_SWITCH` | Dropdown Select | Switch simulated user role | Options: Admin, Finance, Warehouse, Sales, Unauthorized | Pass |
| `BTN_STATE_TOGGLE` | Button Group | Switch simulated UI state | Options: Default, Loading, Empty, Error, Unauthorized | Pass |
| `CARD_KPI_REVENUE` | Metric Card | Displays total sales revenue | Formatted currency string | Pass |
| `CARD_KPI_STOCK` | Metric Card | Displays total inventory value | Real-time calculation | Pass |
| `CARD_KPI_ORDERS` | Metric Card | Displays count of active orders | Reactive state counter | Pass |
| `CARD_KPI_ALERTS` | Metric Card | Displays count of low stock items | Highlighted in amber | Pass |
| `TBL_ORDERS` | Interactive Table | Displays sales order lifecycle | Shows ID, Customer, Amount, Status, and Action | Pass |
| `BTN_CONFIRM_ORDER`| Action Button | Confirms sales order and deducts stock | Disabled if order is not in draft status | Pass |
| `BTN_SHIP_ORDER` | Action Button | Advances order to shipped state | Enabled only for confirmed orders | Pass |
| `TBL_INVENTORY` | Interactive Table | Displays warehouse inventory | Shows SKU, Description, Bin, Stock, Reorder Point | Pass |
| `BTN_ADD_STOCK` | Modal Trigger | Opens stock replenishment modal | Positive integer validation | Pass |
| `TBL_LEDGER` | Interactive Table | Displays double-entry journal | Balances debits and credits | Pass |

---

## 4. Multi-Device & Accessibility Verification
- [x] **Desktop (1920x1080):** Responsive four-column KPI grid and dual-pane operational view.
- [x] **Tablet (768x1024):** Flexible cards with scrolling tables.
- [x] **Mobile (375x667):** Touch targets exceed 44x44 pixels with single-column layout.
- [x] **Accessibility:** High-contrast text colors satisfy WCAG 2.1 AA specifications.
