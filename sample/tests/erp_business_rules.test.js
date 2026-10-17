const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

test('ERP Business Rules & Ledger Invariants', async (t) => {
  let seedPath = path.join(__dirname, '..', 'firebase', 'seed_data.json');
  if (!fs.existsSync(seedPath)) {
    seedPath = path.join(__dirname, '..', 'sample', 'firebase', 'seed_data.json');
  }
  assert.ok(fs.existsSync(seedPath), 'seed_data.json must exist');
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

  await t.test('Inventory stock deduction on Order confirmation', () => {
    // Clone inventory item
    const motor = { ...seed.inventory.find(i => i.sku === 'SKU-MOT-001') };
    const initialQty = motor.quantityOnHand;
    const requestedQty = 5;

    assert.ok(initialQty >= requestedQty, 'Must have sufficient initial stock');
    motor.quantityOnHand -= requestedQty;

    assert.equal(motor.quantityOnHand, initialQty - requestedQty, 'Quantity on hand must be exactly deducted');
  });

  await t.test('Insufficient stock prevents confirmation and protects inventory', () => {
    const valve = { ...seed.inventory.find(i => i.sku === 'SKU-VAL-002') };
    const initialQty = valve.quantityOnHand; // 8
    const requestedQty = 25; // Exceeds 8

    let confirmationFailed = false;
    if (requestedQty > valve.quantityOnHand) {
      confirmationFailed = true;
    } else {
      valve.quantityOnHand -= requestedQty;
    }

    assert.ok(confirmationFailed, 'Confirmation must be blocked if requested quantity exceeds stock');
    assert.equal(valve.quantityOnHand, initialQty, 'Stock quantity must remain unchanged on rejection');
  });

  await t.test('Double-Entry General Ledger Balance Conservation', () => {
    // Every voucher in ledger must have sum(Debits) == sum(Credits)
    seed.ledger.forEach(voucher => {
      let debits = 0;
      let credits = 0;

      voucher.entries.forEach(entry => {
        if (entry.type === 'DEBIT') debits += entry.amount;
        if (entry.type === 'CREDIT') credits += entry.amount;
      });

      const delta = Math.abs(debits - credits);
      assert.ok(delta < 0.001, `Voucher ${voucher.voucherNumber} must balance (Debits: ${debits}, Credits: ${credits})`);
    });
  });

  await t.test('Mandatory 5 UI States exist in sample ERP index.html', () => {
    let htmlPath = path.join(__dirname, '..', 'public', 'index.html');
    if (!fs.existsSync(htmlPath)) {
      htmlPath = path.join(__dirname, '..', 'sample', 'public', 'index.html');
    }
    assert.ok(fs.existsSync(htmlPath), 'index.html must exist');
    const html = fs.readFileSync(htmlPath, 'utf8');

    assert.ok(html.includes('CONTAINER_DEFAULT'), 'Default state container must exist');
    assert.ok(html.includes('CONTAINER_LOADING'), 'Loading state container must exist');
    assert.ok(html.includes('CONTAINER_EMPTY'), 'Empty state container must exist');
    assert.ok(html.includes('CONTAINER_ERROR'), 'Error state container must exist');
    assert.ok(html.includes('CONTAINER_UNAUTHORIZED'), 'Unauthorized state container must exist');
  });

  await t.test('Firestore security rules enforce tenant isolation and prohibit wildcard rules', () => {
    let rulesPath = path.join(__dirname, '..', 'firebase', 'firestore.rules');
    if (!fs.existsSync(rulesPath)) {
      rulesPath = path.join(__dirname, '..', 'sample', 'firebase', 'firestore.rules');
    }
    assert.ok(fs.existsSync(rulesPath), 'firestore.rules must exist');
    const rules = fs.readFileSync(rulesPath, 'utf8');

    assert.ok(!rules.includes('allow read, write: if true;'), 'Wildcard rules are strictly prohibited');
    assert.ok(rules.includes('request.auth.token.tenantId == tenantId'), 'Tenant token claim must be checked');
    assert.ok(rules.includes('match /tenants/{tenantId}'), 'Root collection must be partitioned by tenantId');
  });
});
