/**
 * FinSight — Transactions Ledger Controller
 * Powers transactions.html: Live search, multi-criteria filtering,
 * CSV export, transaction creation, and KPI recalculations.
 */

(function () {
  'use strict';

  let currentSearchQuery = '';
  let currentTypeFilter = 'all';
  let currentCategoryFilter = 'all';
  let currentAccountFilter = 'all';

  const elements = {};

  function cacheElements() {
    elements.search = document.getElementById('txLedgerSearch');
    elements.typeButtons = document.querySelectorAll('.tx-toolbar-controls .tx-filter-btn');
    elements.categoryFilter = document.getElementById('categorySelectFilter');
    elements.accountFilter = document.getElementById('accountSelectFilter');
    elements.exportBtn = document.getElementById('exportBtn');
    elements.ledgerBody = document.getElementById('txLedgerBody');
    elements.txForm = document.getElementById('txForm');

    // KPI Cards
    elements.kpiOutflow = document.querySelector('.card-purple .card-value');
    elements.kpiInflow = document.querySelector('.card-pink .card-value');
    elements.kpiSurplus = document.querySelector('.card-orange .card-value');
    elements.kpiReconciled = document.querySelector('.card-teal .card-value');
  }

  /**
   * Filter and search evaluation
   */
  function applyFilters() {
    if (!elements.ledgerBody) return;
    const rows = elements.ledgerBody.querySelectorAll('.tx-ledger-row');

    let visibleCount = 0;
    let visibleOutflow = 0;
    let visibleInflow = 0;

    rows.forEach(row => {
      const type = row.getAttribute('data-type') || '';
      const cat = row.getAttribute('data-cat') || '';
      const acc = row.getAttribute('data-acc') || '';
      const text = row.textContent.toLowerCase();

      const matchesSearch = !currentSearchQuery || text.includes(currentSearchQuery);
      const matchesType = currentTypeFilter === 'all' || type === currentTypeFilter;
      const matchesCategory = currentCategoryFilter === 'all' || cat.toLowerCase() === currentCategoryFilter.toLowerCase();
      const matchesAccount = currentAccountFilter === 'all' || acc.toLowerCase() === currentAccountFilter.toLowerCase();

      if (matchesSearch && matchesType && matchesCategory && matchesAccount) {
        row.style.display = '';
        visibleCount++;

        // Calculate visible sum
        const amountEl = row.querySelector('.tx-amount-col span');
        if (amountEl) {
          const rawAmt = Number(amountEl.textContent.replace(/[^\d.-]/g, '')) || 0;
          if (type === 'income') visibleInflow += Math.abs(rawAmt);
          else visibleOutflow += Math.abs(rawAmt);
        }
      } else {
        row.style.display = 'none';
      }
    });

    // Check empty state
    let emptyRow = document.getElementById('emptyLedgerRow');
    if (visibleCount === 0) {
      if (!emptyRow) {
        emptyRow = document.createElement('tr');
        emptyRow.id = 'emptyLedgerRow';
        emptyRow.innerHTML = `
          <td colspan="6" style="text-align: center; padding: 36px 20px; color: var(--text-muted); font-style: italic;">
            🔍 No transactions match your active search and filter criteria.
          </td>
        `;
        elements.ledgerBody.appendChild(emptyRow);
      }
      emptyRow.style.display = '';
    } else if (emptyRow) {
      emptyRow.style.display = 'none';
    }
  }

  /**
   * Search input listener
   */
  function initSearch() {
    if (!elements.search) return;
    elements.search.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  /**
   * Toolbar filters: Type buttons & dropdowns
   */
  function initFilters() {
    if (elements.typeButtons) {
      elements.typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          elements.typeButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentTypeFilter = btn.getAttribute('data-filter') || 'all';
          applyFilters();
        });
      });
    }

    if (elements.categoryFilter) {
      elements.categoryFilter.addEventListener('change', (e) => {
        currentCategoryFilter = e.target.value;
        applyFilters();
      });
    }

    if (elements.accountFilter) {
      elements.accountFilter.addEventListener('change', (e) => {
        currentAccountFilter = e.target.value;
        applyFilters();
      });
    }
  }

  /**
   * CSV Ledger Export
   */
  function initExport() {
    if (!elements.exportBtn) return;

    elements.exportBtn.addEventListener('click', () => {
      const rows = elements.ledgerBody.querySelectorAll('.tx-ledger-row');
      const csvData = [
        ['Date & Time', 'Merchant / Details', 'Category', 'Payment Method', 'Status', 'Type', 'Amount (INR)']
      ];

      rows.forEach(row => {
        if (row.style.display === 'none') return; // Export visible/filtered only

        const date = row.querySelector('.tx-date-cell')?.textContent.trim() || '';
        const name = row.querySelector('.tx-name')?.textContent.trim() || '';
        const cat = row.querySelector('.tx-category-tag')?.textContent.trim() || '';
        const method = row.querySelector('.tx-method-pill')?.textContent.trim() || '';
        const status = row.querySelector('.tx-status-badge')?.textContent.trim() || '';
        const amount = row.querySelector('.tx-amount-col span')?.textContent.trim() || '';
        const type = row.getAttribute('data-type') || 'expense';

        csvData.push([
          `"${date.replace(/"/g, '""')}"`,
          `"${name.replace(/"/g, '""')}"`,
          `"${cat.replace(/"/g, '""')}"`,
          `"${method.replace(/"/g, '""')}"`,
          `"${status.replace(/"/g, '""')}"`,
          `"${type}"`,
          `"${amount.replace(/"/g, '""')}"`
        ]);
      });

      if (csvData.length === 1) {
        FinSight.showToast('⚠️ No transactions visible to export.');
        return;
      }

      const csvContent = 'data:text/csv;charset=utf-8,' + csvData.map(e => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `FinSight-Transactions-Ledger-${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      FinSight.showToast(`📥 Exported ${csvData.length - 1} transactions to CSV!`);
    });
  }

  /**
   * Add new transaction via Modal Form
   */
  function initTxForm() {
    if (!elements.txForm) return;

    elements.txForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('txTitle')?.value.trim() || 'Untitled Transaction';
      const type = document.getElementById('txType')?.value || 'expense';
      const category = document.getElementById('txCategory')?.value || 'Shopping';
      const amount = Number(document.getElementById('txAmount')?.value) || 0;

      const isExpense = type === 'expense';
      const badgeClass = isExpense ? 'tx-badge-negative' : 'tx-badge-positive';
      const sign = isExpense ? '-' : '+';

      // Icon map
      const iconMap = {
        Shopping: '🛒',
        Food: '🍔',
        Utilities: '⚡',
        Income: '💼',
        Entertainment: '🎬',
        Commute: '🚗',
        Investments: '📈'
      };
      const icon = iconMap[category] || '💳';

      const newRow = document.createElement('tr');
      newRow.className = 'tx-ledger-row';
      newRow.setAttribute('data-type', type);
      newRow.setAttribute('data-cat', category);
      newRow.setAttribute('data-acc', 'HDFC');

      newRow.innerHTML = `
        <td><span class="tx-date-cell">Just now</span></td>
        <td>
          <div class="tx-title-wrapper">
            <span class="tx-icon">${icon}</span>
            <div>
              <span class="tx-name">${title}</span>
              <span class="tx-date">Web Logging</span>
            </div>
          </div>
        </td>
        <td><span class="tx-category-tag">${category}</span></td>
        <td><span class="tx-method-pill">HDFC Bank Direct</span></td>
        <td><span class="tx-status-badge status-completed">Completed</span></td>
        <td class="tx-amount-col"><span class="${badgeClass}">${sign}${FinSight.formatINR(amount)}</span></td>
      `;

      if (elements.ledgerBody) {
        elements.ledgerBody.insertBefore(newRow, elements.ledgerBody.firstChild);
      }

      // Update KPIs
      if (isExpense && elements.kpiOutflow) {
        const cur = Number(elements.kpiOutflow.textContent.replace(/[^\d]/g, '')) || 28410;
        elements.kpiOutflow.textContent = FinSight.formatINR(cur + amount);
      } else if (!isExpense && elements.kpiInflow) {
        const cur = Number(elements.kpiInflow.textContent.replace(/[^\d]/g, '')) || 83500;
        elements.kpiInflow.textContent = FinSight.formatINR(cur + amount);
      }

      // Update counters
      const allBtn = document.querySelector('[data-filter="all"]');
      if (allBtn) {
        const curCount = elements.ledgerBody.querySelectorAll('.tx-ledger-row').length;
        allBtn.textContent = `All (${curCount})`;
      }

      FinSight.closeModal('txModal');
      FinSight.showToast(`✅ Added ${title} (${sign}${FinSight.formatINR(amount)}) to ledger!`);

      applyFilters();
    });
  }

  function init() {
    cacheElements();
    initSearch();
    initFilters();
    initExport();
    initTxForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

