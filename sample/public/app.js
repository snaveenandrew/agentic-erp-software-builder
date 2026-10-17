/**
 * ApexFlow ERP — Agentic Software Factory Sample Implementation
 * 
 * Features:
 * 1. 5 Mandatory UI States: Default, Loading, Empty, Error, Unauthorized
 * 2. Role-Based Access Control: Admin, Finance, Warehouse, Sales, Unauthorized
 * 3. Supply Chain & Order-to-Cash State Transitions (Draft -> Confirmed -> Shipped)
 * 4. Real-time Inventory Deductions & Low Stock Warnings
 * 5. Double-Entry General Ledger Balance Validation (Debits == Credits)
 */

// Initial Seed Data
const DEFAULT_SEED = {
  tenantId: 'tenant-acme-logistics',
  inventory: [
    {
      id: 'INV-101',
      sku: 'SKU-MOT-001',
      name: 'Industrial Servo Motor 750W',
      category: 'Motion Control',
      binLocation: 'WH-A-12-04',
      quantityOnHand: 45,
      allocatedQuantity: 10,
      reorderPoint: 15,
      unitCost: 320.00,
      unitPrice: 540.00,
      status: 'IN_STOCK'
    },
    {
      id: 'INV-102',
      sku: 'SKU-VAL-002',
      name: 'Pneumatic Solenoid Valve 24V',
      category: 'Pneumatics',
      binLocation: 'WH-B-03-01',
      quantityOnHand: 8,
      allocatedQuantity: 2,
      reorderPoint: 20,
      unitCost: 85.00,
      unitPrice: 145.00,
      status: 'LOW_STOCK'
    },
    {
      id: 'INV-103',
      sku: 'SKU-PLC-003',
      name: 'Compact Modular PLC Unit',
      category: 'Controllers',
      binLocation: 'WH-A-01-08',
      quantityOnHand: 62,
      allocatedQuantity: 5,
      reorderPoint: 10,
      unitCost: 680.00,
      unitPrice: 1150.00,
      status: 'IN_STOCK'
    },
    {
      id: 'INV-104',
      sku: 'SKU-BELT-004',
      name: 'Heavy Duty Conveyor Belt 50m',
      category: 'Mechanical',
      binLocation: 'WH-YARD-09',
      quantityOnHand: 4,
      allocatedQuantity: 0,
      reorderPoint: 5,
      unitCost: 1200.00,
      unitPrice: 1950.00,
      status: 'LOW_STOCK'
    },
    {
      id: 'INV-105',
      sku: 'SKU-SENS-005',
      name: 'Laser Distance Optical Sensor',
      category: 'Sensors',
      binLocation: 'WH-B-08-02',
      quantityOnHand: 110,
      allocatedQuantity: 12,
      reorderPoint: 25,
      unitCost: 110.00,
      unitPrice: 195.00,
      status: 'IN_STOCK'
    }
  ],
  orders: [
    {
      id: 'SO-2026-001',
      orderNumber: 'ORD-9821',
      customerName: 'Pacific Automation Systems',
      status: 'DRAFT',
      createdAt: '2026-10-17',
      items: [
        { sku: 'SKU-MOT-001', name: 'Industrial Servo Motor 750W', quantity: 5, unitPrice: 540.00, total: 2700.00 },
        { sku: 'SKU-SENS-005', name: 'Laser Distance Optical Sensor', quantity: 10, unitPrice: 195.00, total: 1950.00 }
      ],
      subtotal: 4650.00,
      tax: 372.00,
      totalAmount: 5022.00
    },
    {
      id: 'SO-2026-002',
      orderNumber: 'ORD-9822',
      customerName: 'Apex Robotics Ltd',
      status: 'CONFIRMED',
      createdAt: '2026-10-16',
      items: [
        { sku: 'SKU-PLC-003', name: 'Compact Modular PLC Unit', quantity: 2, unitPrice: 1150.00, total: 2300.00 }
      ],
      subtotal: 2300.00,
      tax: 184.00,
      totalAmount: 2484.00
    },
    {
      id: 'SO-2026-003',
      orderNumber: 'ORD-9820',
      customerName: 'Midwest Machine Works',
      status: 'SHIPPED',
      createdAt: '2026-10-15',
      items: [
        { sku: 'SKU-MOT-001', name: 'Industrial Servo Motor 750W', quantity: 4, unitPrice: 540.00, total: 2160.00 }
      ],
      subtotal: 2160.00,
      tax: 172.80,
      totalAmount: 2332.80
    }
  ],
  ledger: [
    {
      id: 'JV-2026-1001',
      voucherNumber: 'JV-001001',
      referenceOrder: 'ORD-9820',
      timestamp: '2026-10-15',
      description: 'Revenue recognition and AR for Order ORD-9820',
      entries: [
        { accountCode: '1100', accountName: 'Accounts Receivable', type: 'DEBIT', amount: 2332.80 },
        { accountCode: '4000', accountName: 'Sales Revenue', type: 'CREDIT', amount: 2160.00 },
        { accountCode: '2200', accountName: 'Sales Tax Payable', type: 'CREDIT', amount: 172.80 }
      ]
    },
    {
      id: 'JV-2026-1002',
      voucherNumber: 'JV-001002',
      referenceOrder: 'ORD-9820',
      timestamp: '2026-10-15',
      description: 'COGS recognition for Order ORD-9820',
      entries: [
        { accountCode: '5000', accountName: 'Cost of Goods Sold', type: 'DEBIT', amount: 1280.00 },
        { accountCode: '1200', accountName: 'Inventory Asset', type: 'CREDIT', amount: 1280.00 }
      ]
    }
  ]
};

// Application State Store
class ERPStore {
  constructor() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_SEED));
    this.currentRole = 'Admin';
    this.activeUIState = 'default';
  }

  resetSeed() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_SEED));
    this.setUIState('default');
  }

  setRole(role) {
    this.currentRole = role;
    if (role === 'Unauthorized') {
      this.setUIState('unauthorized');
    } else if (this.activeUIState === 'unauthorized') {
      this.setUIState('default');
    }
    this.render();
  }

  setUIState(stateName) {
    this.activeUIState = stateName;
    const containers = {
      default: document.getElementById('CONTAINER_DEFAULT'),
      loading: document.getElementById('CONTAINER_LOADING'),
      empty: document.getElementById('CONTAINER_EMPTY'),
      error: document.getElementById('CONTAINER_ERROR'),
      unauthorized: document.getElementById('CONTAINER_UNAUTHORIZED')
    };

    // Toggle container visibilities
    Object.keys(containers).forEach(key => {
      if (containers[key]) {
        if (key === stateName) {
          containers[key].classList.add('state-active');
        } else {
          containers[key].classList.remove('state-active');
        }
      }
    });

    // Update state buttons active class
    document.querySelectorAll('.state-pill').forEach(btn => {
      if (btn.dataset.state === stateName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (stateName === 'default') {
      this.render();
    }
  }

  // Confirm order and apply stock deduction + ledger journal creation
  confirmOrder(orderId) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;

    // Check inventory availability for all items
    for (const lineItem of order.items) {
      const inv = this.state.inventory.find(i => i.sku === lineItem.sku);
      if (!inv || inv.quantityOnHand < lineItem.quantity) {
        alert(`Stockout Warning! Insufficient inventory for SKU: ${lineItem.sku}. Available: ${inv ? inv.quantityOnHand : 0}, Requested: ${lineItem.quantity}`);
        return;
      }
    }

    // Deduct stock and update inventory status
    let totalCogs = 0;
    for (const lineItem of order.items) {
      const inv = this.state.inventory.find(i => i.sku === lineItem.sku);
      inv.quantityOnHand -= lineItem.quantity;
      if (inv.quantityOnHand <= inv.reorderPoint) {
        inv.status = 'LOW_STOCK';
      }
      totalCogs += lineItem.quantity * inv.unitCost;
    }

    // Transition status to CONFIRMED
    order.status = 'CONFIRMED';

    // Auto-generate double-entry journal vouchers in General Ledger
    const today = new Date().toISOString().split('T')[0];
    const nextJvNum = 1000 + this.state.ledger.length + 1;

    // 1. Revenue & Receivable Voucher
    this.state.ledger.push({
      id: `JV-2026-${nextJvNum}`,
      voucherNumber: `JV-00${nextJvNum}`,
      referenceOrder: order.orderNumber,
      timestamp: today,
      description: `Revenue recognition and AR for Order ${order.orderNumber}`,
      entries: [
        { accountCode: '1100', accountName: 'Accounts Receivable', type: 'DEBIT', amount: order.totalAmount },
        { accountCode: '4000', accountName: 'Sales Revenue', type: 'CREDIT', amount: order.subtotal },
        { accountCode: '2200', accountName: 'Sales Tax Payable', type: 'CREDIT', amount: order.tax }
      ]
    });

    // 2. COGS & Inventory Asset Voucher
    const nextJvNum2 = nextJvNum + 1;
    this.state.ledger.push({
      id: `JV-2026-${nextJvNum2}`,
      voucherNumber: `JV-00${nextJvNum2}`,
      referenceOrder: order.orderNumber,
      timestamp: today,
      description: `COGS recognition for Order ${order.orderNumber}`,
      entries: [
        { accountCode: '5000', accountName: 'Cost of Goods Sold', type: 'DEBIT', amount: totalCogs },
        { accountCode: '1200', accountName: 'Inventory Asset', type: 'CREDIT', amount: totalCogs }
      ]
    });

    this.render();
  }

  // Ship order
  shipOrder(orderId) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order && order.status === 'CONFIRMED') {
      order.status = 'SHIPPED';
      this.render();
    }
  }

  // Replenish stock
  replenishStock(sku, quantity) {
    const inv = this.state.inventory.find(i => i.sku === sku);
    if (inv) {
      inv.quantityOnHand += Number(quantity);
      if (inv.quantityOnHand > inv.reorderPoint) {
        inv.status = 'IN_STOCK';
      }
      this.render();
    }
  }

  // Create new sales order
  createOrder(customerName, sku, quantity) {
    const inv = this.state.inventory.find(i => i.sku === sku);
    if (!inv) return;

    const subtotal = inv.unitPrice * quantity;
    const tax = Number((subtotal * 0.08).toFixed(2));
    const totalAmount = Number((subtotal + tax).toFixed(2));
    const nextOrderNum = 9820 + this.state.orders.length + 1;

    const newOrder = {
      id: `SO-2026-00${this.state.orders.length + 1}`,
      orderNumber: `ORD-${nextOrderNum}`,
      customerName: customerName,
      status: 'DRAFT',
      createdAt: new Date().toISOString().split('T')[0],
      items: [
        { sku: inv.sku, name: inv.name, quantity: Number(quantity), unitPrice: inv.unitPrice, total: subtotal }
      ],
      subtotal: subtotal,
      tax: tax,
      totalAmount: totalAmount
    };

    this.state.orders.unshift(newOrder);
    this.render();
  }

  render() {
    // 1. Calculate and update KPIs
    let totalRevenue = 0;
    this.state.orders.forEach(o => {
      if (o.status === 'CONFIRMED' || o.status === 'SHIPPED') {
        totalRevenue += o.totalAmount;
      }
    });

    let totalValuation = 0;
    let lowStockCount = 0;
    this.state.inventory.forEach(item => {
      totalValuation += item.quantityOnHand * item.unitCost;
      if (item.quantityOnHand <= item.reorderPoint) {
        lowStockCount++;
      }
    });

    const activeOrderCount = this.state.orders.length;

    const elRevenue = document.getElementById('VAL_KPI_REVENUE');
    const elStock = document.getElementById('VAL_KPI_STOCK');
    const elOrders = document.getElementById('VAL_KPI_ORDERS');
    const elAlerts = document.getElementById('VAL_KPI_ALERTS');

    if (elRevenue) elRevenue.textContent = `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elStock) elStock.textContent = `$${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elOrders) elOrders.textContent = `${activeOrderCount} Orders`;
    if (elAlerts) elAlerts.textContent = `${lowStockCount} Items`;

    // 2. Render Orders Table
    const tbodyOrders = document.getElementById('TBODY_ORDERS');
    if (tbodyOrders) {
      tbodyOrders.innerHTML = '';
      this.state.orders.forEach(order => {
        const tr = document.createElement('tr');
        
        let statusBadgeClass = 'badge-draft';
        if (order.status === 'CONFIRMED') statusBadgeClass = 'badge-confirmed';
        if (order.status === 'SHIPPED') statusBadgeClass = 'badge-shipped';

        // Action Buttons based on Role & Status
        let actionButtons = '';
        const canManageOrder = this.currentRole === 'Admin' || this.currentRole === 'Warehouse';

        if (order.status === 'DRAFT') {
          if (canManageOrder) {
            actionButtons = `<button class="btn btn-primary btn-sm" onclick="appStore.confirmOrder('${order.id}')">Confirm & Allocate</button>`;
          } else {
            actionButtons = `<span style="font-size:0.75rem; color:var(--text-muted);">Awaiting Warehouse</span>`;
          }
        } else if (order.status === 'CONFIRMED') {
          if (canManageOrder) {
            actionButtons = `<button class="btn btn-secondary btn-sm" onclick="appStore.shipOrder('${order.id}')">Mark Shipped</button>`;
          } else {
            actionButtons = `<span style="font-size:0.75rem; color:var(--text-muted);">Allocated</span>`;
          }
        } else {
          actionButtons = `<span style="color:var(--accent-success); font-weight:600; font-size:0.8rem;">✓ Fulfilled</span>`;
        }

        const itemsSummary = order.items.map(it => `${it.quantity}x ${it.sku}`).join(', ');

        tr.innerHTML = `
          <td><strong>${order.orderNumber}</strong></td>
          <td>${order.customerName}</td>
          <td>${order.createdAt}</td>
          <td>${itemsSummary}</td>
          <td>$${order.totalAmount.toFixed(2)}</td>
          <td><span class="badge ${statusBadgeClass}">${order.status}</span></td>
          <td>${actionButtons}</td>
        `;
        tbodyOrders.appendChild(tr);
      });
    }

    // 3. Render Inventory Table
    const tbodyInventory = document.getElementById('TBODY_INVENTORY');
    if (tbodyInventory) {
      tbodyInventory.innerHTML = '';
      this.state.inventory.forEach(item => {
        const tr = document.createElement('tr');
        const badgeClass = item.status === 'IN_STOCK' ? 'badge-in_stock' : 'badge-low_stock';
        const isWarehouseOrAdmin = this.currentRole === 'Admin' || this.currentRole === 'Warehouse';
        
        const actionHtml = isWarehouseOrAdmin
          ? `<button class="btn btn-secondary btn-sm" onclick="openReplenishModal('${item.sku}')">+ Replenish</button>`
          : `<span style="color:var(--text-muted); font-size:0.8rem;">Read Only</span>`;

        tr.innerHTML = `
          <td><code>${item.sku}</code></td>
          <td><strong>${item.name}</strong><br><small style="color:var(--text-muted);">${item.category}</small></td>
          <td>${item.binLocation}</td>
          <td style="font-weight:600;">${item.quantityOnHand}</td>
          <td>${item.allocatedQuantity}</td>
          <td>${item.reorderPoint}</td>
          <td><span class="badge ${badgeClass}">${item.status.replace('_', ' ')}</span></td>
          <td>${actionHtml}</td>
        `;
        tbodyInventory.appendChild(tr);
      });
    }

    // 4. Render Financial General Ledger Table & Check Balance
    const tbodyLedger = document.getElementById('TBODY_LEDGER');
    const ledgerSection = document.getElementById('SEC_LEDGER');

    // Role check: Hide ledger for Sales / Warehouse if strictly RBAC
    if (this.currentRole === 'Sales') {
      if (ledgerSection) ledgerSection.style.display = 'none';
    } else {
      if (ledgerSection) ledgerSection.style.display = 'block';
    }

    if (tbodyLedger) {
      tbodyLedger.innerHTML = '';
      let sumDebits = 0;
      let sumCredits = 0;

      this.state.ledger.forEach(voucher => {
        voucher.entries.forEach(entry => {
          if (entry.type === 'DEBIT') sumDebits += entry.amount;
          if (entry.type === 'CREDIT') sumCredits += entry.amount;

          const tr = document.createElement('tr');
          const badgeType = entry.type === 'DEBIT' ? 'badge-debit' : 'badge-credit';

          tr.innerHTML = `
            <td><strong>${voucher.voucherNumber}</strong></td>
            <td>${voucher.referenceOrder}</td>
            <td>${voucher.timestamp}</td>
            <td><code>${entry.accountCode}</code> ${entry.accountName}</td>
            <td><span class="badge ${badgeType}">${entry.type}</span></td>
            <td style="font-weight:600;">$${entry.amount.toFixed(2)}</td>
            <td style="color:var(--text-muted); font-size:0.8rem;">${voucher.description}</td>
          `;
          tbodyLedger.appendChild(tr);
        });
      });

      // Update Ledger Balance Badge
      const elBalance = document.getElementById('TXT_LEDGER_BALANCE');
      const delta = Math.abs(sumDebits - sumCredits);
      if (elBalance) {
        if (delta < 0.01) {
          elBalance.className = 'badge badge-in_stock';
          elBalance.textContent = `Balanced (Debits = Credits = $${sumDebits.toFixed(2)})`;
        } else {
          elBalance.className = 'badge badge-low_stock';
          elBalance.textContent = `UNBALANCED (Δ = $${delta.toFixed(2)})`;
        }
      }
    }

    // Populate dropdowns in modals
    this.populateModalDropdowns();
  }

  populateModalDropdowns() {
    const selOrderItem = document.getElementById('INP_ORDER_ITEM');
    const selStockSku = document.getElementById('INP_STOCK_SKU');

    if (selOrderItem && selOrderItem.options.length === 0) {
      this.state.inventory.forEach(inv => {
        const opt = document.createElement('option');
        opt.value = inv.sku;
        opt.textContent = `${inv.sku} - ${inv.name} ($${inv.unitPrice})`;
        selOrderItem.appendChild(opt);
      });
    }

    if (selStockSku && selStockSku.options.length === 0) {
      this.state.inventory.forEach(inv => {
        const opt = document.createElement('option');
        opt.value = inv.sku;
        opt.textContent = `${inv.sku} - ${inv.name}`;
        selStockSku.appendChild(opt);
      });
    }
  }
}

// Global Store Instance
const appStore = new ERPStore();

// Setup DOM Events
document.addEventListener('DOMContentLoaded', () => {
  appStore.render();

  // Role Switcher
  const selRole = document.getElementById('SEL_USER_ROLE');
  if (selRole) {
    selRole.addEventListener('change', (e) => {
      appStore.setRole(e.target.value);
    });
  }

  // 5-State Simulator Buttons
  document.querySelectorAll('.state-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      appStore.setUIState(btn.dataset.state);
    });
  });

  // State Action Triggers
  const btnReset = document.getElementById('BTN_RESET_SEED');
  if (btnReset) btnReset.addEventListener('click', () => appStore.resetSeed());

  const btnRetry = document.getElementById('BTN_RETRY_ERROR');
  if (btnRetry) btnRetry.addEventListener('click', () => appStore.setUIState('default'));

  const btnElevate = document.getElementById('BTN_ELEVATE_ROLE');
  if (btnElevate) {
    btnElevate.addEventListener('click', () => {
      if (selRole) selRole.value = 'Admin';
      appStore.setRole('Admin');
    });
  }

  // Navigation Items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const tab = item.dataset.tab;
      const secOrders = document.getElementById('SEC_ORDERS');
      const secInventory = document.getElementById('SEC_INVENTORY');
      const secLedger = document.getElementById('SEC_LEDGER');

      if (tab === 'overview') {
        secOrders.style.display = 'block';
        secInventory.style.display = 'block';
        if (appStore.currentRole !== 'Sales') secLedger.style.display = 'block';
      } else if (tab === 'orders') {
        secOrders.style.display = 'block';
        secInventory.style.display = 'none';
        secLedger.style.display = 'none';
      } else if (tab === 'inventory') {
        secOrders.style.display = 'none';
        secInventory.style.display = 'block';
        secLedger.style.display = 'none';
      } else if (tab === 'ledger') {
        secOrders.style.display = 'none';
        secInventory.style.display = 'none';
        secLedger.style.display = 'block';
      }
    });
  });

  // Modals
  const modalOrder = document.getElementById('MODAL_ORDER');
  const btnOpenOrder = document.getElementById('BTN_OPEN_ORDER_MODAL');
  const btnCloseOrder = document.getElementById('BTN_CLOSE_ORDER_MODAL');
  const btnCancelOrder = document.getElementById('BTN_CANCEL_ORDER_MODAL');
  const formOrder = document.getElementById('FORM_NEW_ORDER');

  if (btnOpenOrder) btnOpenOrder.addEventListener('click', () => modalOrder.classList.add('active'));
  if (btnCloseOrder) btnCloseOrder.addEventListener('click', () => modalOrder.classList.remove('active'));
  if (btnCancelOrder) btnCancelOrder.addEventListener('click', () => modalOrder.classList.remove('active'));

  if (formOrder) {
    formOrder.addEventListener('submit', (e) => {
      e.preventDefault();
      const customer = document.getElementById('INP_ORDER_CUSTOMER').value;
      const sku = document.getElementById('INP_ORDER_ITEM').value;
      const qty = parseInt(document.getElementById('INP_ORDER_QTY').value, 10);
      appStore.createOrder(customer, sku, qty);
      modalOrder.classList.remove('active');
    });
  }

  const modalStock = document.getElementById('MODAL_STOCK');
  const btnOpenStock = document.getElementById('BTN_OPEN_STOCK_MODAL');
  const btnCloseStock = document.getElementById('BTN_CLOSE_STOCK_MODAL');
  const btnCancelStock = document.getElementById('BTN_CANCEL_STOCK_MODAL');
  const formStock = document.getElementById('FORM_REPLENISH');

  if (btnOpenStock) btnOpenStock.addEventListener('click', () => modalStock.classList.add('active'));
  if (btnCloseStock) btnCloseStock.addEventListener('click', () => modalStock.classList.remove('active'));
  if (btnCancelStock) btnCancelStock.addEventListener('click', () => modalStock.classList.remove('active'));

  if (formStock) {
    formStock.addEventListener('submit', (e) => {
      e.preventDefault();
      const sku = document.getElementById('INP_STOCK_SKU').value;
      const qty = parseInt(document.getElementById('INP_REPLENISH_QTY').value, 10);
      appStore.replenishStock(sku, qty);
      modalStock.classList.remove('active');
    });
  }
});

// Helper for modal trigger
function openReplenishModal(sku) {
  const modalStock = document.getElementById('MODAL_STOCK');
  const selStockSku = document.getElementById('INP_STOCK_SKU');
  if (selStockSku) selStockSku.value = sku;
  if (modalStock) modalStock.classList.add('active');
}
