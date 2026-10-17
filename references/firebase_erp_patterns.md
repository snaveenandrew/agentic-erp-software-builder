# Firebase ERP Architecture & Patterns Reference

<!-- Technical blueprint patterns for Cloud Firestore, Data Connect, Cloud Functions, and Emulator testing. -->

## 1. Storage Strategy: Firestore vs Data Connect

| Dimension | Cloud Firestore | Firebase Data Connect (PostgreSQL on Cloud SQL) |
| :-------- | :-------------- | :---------------------------------------------- |
| **Best For** | Real-time events, operational yard moves, mobile dispatch, notifications. | Financial ledgers, double-entry bookkeeping, complex SQL joins, audits. |
| **Transactions** | Up to 500 document writes per transaction batch. | ACID multi-table relational transactions. |
| **Pricing Model** | Document reads, writes, deletes, and storage volume. | Cloud SQL instance uptime + Data Connect request execution. |
| **Offline Sync** | Built-in offline persistence for client SDKs. | Client cache via GraphQL queries; no native offline mutation queue. |
| **Recommended ERP Pattern** | Hybrid: Firestore for real-time operations; Data Connect for financial & master data. |

---

## 2. Multi-Tenancy Architecture Options

### Option A: Tenant-Scoped Collections (Shared Project)
- **Data Model:** Root collection partitioned by `tenantId`: `/tenants/{tenantId}/orders/{orderId}`.
- **Security Rule:** Enforce tenant isolation via Firebase Auth Custom Claims:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /tenants/{tenantId}/{document=**} {
        allow read, write: if request.auth != null && request.auth.token.tenantId == tenantId;
      }
    }
  }
  ```
- **Tradeoffs:** Lower cost, simpler deployment; requires strict security rule audits.

### Option B: Project-Per-Tenant
- **Data Model:** Completely isolated GCP/Firebase projects per client company.
- **Tradeoffs:** Absolute physical isolation, independent backups, higher management overhead.

---

## 3. Cloud Functions Best Practices

1. **Idempotency:**
   - Every financial, billing, or external webhook call must supply an `idempotencyKey`.
   - Store executed keys in `/idempotency_keys/{key}` with a 24-hour TTL.
2. **Cold-Start Optimization:**
   - Keep dependencies lean. Avoid monolithic function exports.
   - Use minimum instances (`minInstances: 1`) for critical interactive payment/dispatch endpoints.
3. **Trigger Safety:**
   - Always guard against infinite trigger loops (e.g., function triggered by document update that modifies the same document).

---

## 4. Local Verification via Emulator Suite
All automated CI pipelines must boot the Firebase Emulator Suite prior to running test suites:
```bash
firebase emulators:exec --only firestore,auth,functions "npm run test:ci"
```
Zero pull requests may merge without passing automated emulator checks.

---

## 5. Financial Ledger & Accounting Invariants

ERP systems manage legally binding financial records. They must adhere to GAAP/IFRS standards:

### A. Immutable Double-Entry General Ledger
- **Invariant:** For every financial transaction, $\sum \text{Debits} = \sum \text{Credits}$.
- **Append-Only Immutability:** Never run `UPDATE` or `DELETE` queries on ledger records. Corrections must be booked as new reversing journal entries (`type: 'REVERSAL'`).
- **Storage Target:** Firebase Data Connect (PostgreSQL) or append-only Firestore collection `/tenants/{tenantId}/journal_entries/{entryId}` with Security Rules prohibiting update and delete:
  ```javascript
  match /tenants/{tenantId}/journal_entries/{entryId} {
    allow create: if request.auth != null && isValidLedgerEntry(request.resource.data);
    allow update, delete: if false; // Strict immutability
  }
  ```

### B. Sequential Gapless Document Numbering
Tax compliance mandates strictly sequential, gapless numbering (e.g., `INV-2026-00001`, `INV-2026-00002`).
- **PostgreSQL / Data Connect Pattern:** Use native database sequences (`CREATE SEQUENCE invoice_seq;`) within an ACID transaction.
- **Firestore Pattern:** Use a dedicated shard counter document with transactional increment:
  ```typescript
  await db.runTransaction(async (transaction) => {
    const counterRef = db.doc(`tenants/${tenantId}/counters/invoices_${fiscalYear}`);
    const counterSnap = await transaction.get(counterRef);
    const nextVal = (counterSnap.data()?.current || 0) + 1;
    transaction.set(counterRef, { current: nextVal }, { merge: true });
    
    const formattedId = `INV-${fiscalYear}-${String(nextVal).padStart(6, '0')}`;
    transaction.create(invoiceRef, { ...invoiceData, invoiceNumber: formattedId });
  });
  ```

---

## 6. Distributed Sagas & The Transactional Outbox Pattern

Complex ERP operations span multiple aggregates (e.g., Order $\rightarrow$ Inventory $\rightarrow$ Payment $\rightarrow$ Shipping).

### A. Transactional Outbox Pattern
To prevent dual-write inconsistencies between Firestore and external APIs (Stripe, carrier dispatch):
1. Write the domain entity and an `outbox` event document within the **same atomic Firestore transaction**:
   ```typescript
   transaction.set(orderRef, orderData);
   transaction.set(outboxRef, {
     eventType: 'ORDER_PLACED',
     payload: { orderId, amount, customerId },
     status: 'PENDING',
     createdAt: FieldValue.serverTimestamp()
   });
   ```
2. A background Cloud Function (`onDocumentCreated('outbox/{id}')`) delivers the event with retries.

### B. Saga Orchestration & Compensating Actions
When a multi-step transaction fails midway, the orchestrator triggers compensating transactions:
```
[Step 1: Reserve Inventory]  --> SUCCESS
[Step 2: Authorize Payment]  --> FAILED!
[Compensation 1: Cancel Inventory Reservation] --> TRIGGERED & LOGGED
```

---

## 7. Optimistic Concurrency Control (OCC)

To prevent lost updates when multiple users edit the same ERP entity concurrently:
1. Every mutable entity maintains a monotonic `version: number`.
2. Updates must verify the expected version in a transaction or precondition:
   ```typescript
   await db.runTransaction(async (tx) => {
     const doc = await tx.get(itemRef);
     if (doc.data().version !== expectedVersion) {
       throw new Error('CONCURRENCY_CONFLICT: Document modified by another user.');
     }
     tx.update(itemRef, {
       ...updates,
       version: expectedVersion + 1,
       updatedAt: FieldValue.serverTimestamp()
     });
   });
   ```

---

## 8. Durable Asynchronous Queueing (Google Cloud Tasks)

Cloud Functions have time limits and can drop work under load. Use Google Cloud Tasks for enterprise background jobs:
- **Rate-Limiting & Throttling:** Throttle external vendor APIs (e.g., carrier rate lookups limited to 10 req/sec).
- **Long-Running & Delayed Operations:** Schedule payment retries, reminder notifications, and end-of-day reconciliation.
- **Durable Retries with Exponential Backoff:** Failed webhook deliveries auto-retry up to 5 times with dead-letter queue (DLQ) alerts.

---

## 9. Full-Text Search & Multi-Field Filtering (Typesense / Algolia)

Firestore cannot perform substring search or complex multi-facet filtering.
- **CDC Sync Architecture:**
  1. Firestore document write triggers `onDocumentWritten('/tenants/{t}/orders/{id}')`.
  2. Cloud Function extracts search facets (customer name, SKU, tracking code, status) and streams to **Typesense / Algolia**.
  3. Frontend searches against the search engine index and retrieves Firestore document IDs for full rendering.

---

## 10. Database Connection Pooling (Data Connect & PostgreSQL)

When using Firebase Data Connect with Cloud SQL (PostgreSQL):
- Serverless Cloud Functions scaling horizontally can exhaust PostgreSQL connection limits (`max_connections = 100`).
- **Mandatory Configuration:** Place **PgBouncer** or Cloud SQL Auth Proxy in transaction-pooling mode between Cloud Functions and PostgreSQL to multiplex thousands of serverless requests over a small persistent connection pool.
