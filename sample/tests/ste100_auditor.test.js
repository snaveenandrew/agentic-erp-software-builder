const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const { auditText } = require('../src/engine/ste100_auditor');

test('ASD-STE100 Auditor Compliance Engine', async (t) => {
  await t.test('Flags sentences exceeding 20 words for procedural steps', () => {
    const text = `1. The operator must unconditionally verify and validate all warehouse shipment parameters before initiating any database transactions or updates to prevent discrepancies.`;
    const res = auditText(text, 'test-proc.md');
    assert.equal(res.violations.length, 1);
    assert.equal(res.violations[0].type, 'Procedural length exceeded');
    assert.ok(res.violations[0].actual > 20);
  });

  await t.test('Flags forbidden filler words', () => {
    const text = `The system is basically very simple to operate for all warehouse personnel.`;
    const res = auditText(text, 'test-fluff.md');
    assert.ok(res.violations.some(v => v.type.includes('basically')));
  });

  await t.test('Accepts compliant concise procedural and descriptive statements', () => {
    const text = `
# Inventory Guide
1. Check the warehouse bin location.
2. Confirm the required item quantity.
3. Submit the inventory balance update.
`;
    const res = auditText(text, 'test-good.md');
    assert.equal(res.violations.length, 0);
    assert.equal(res.score, 1.0);
    assert.equal(res.passed, true);
  });

  await t.test('Sample ERP specification documents meet or exceed 80% compliance', () => {
    const docs = ['REQ-SCM-001.md', 'ADR-001-hybrid-firestore-ledger.md', 'TEST-SCM-001.md'];
    for (const doc of docs) {
      let docPath = path.join(__dirname, '..', 'docs', doc);
      if (!fs.existsSync(docPath)) {
        docPath = path.join(__dirname, '..', 'sample', 'docs', doc);
      }
      assert.ok(fs.existsSync(docPath), `${doc} must exist at ${docPath}`);
      const content = fs.readFileSync(docPath, 'utf8');
      const res = auditText(content, doc);
      assert.ok(res.score >= 0.80, `${doc} score (${(res.score * 100).toFixed(1)}%) must be >= 80%`);
    }
  });
});
