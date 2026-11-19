/**
 * FinSight — Dashboard Controller
 * Powers index.html: Timeframe switches, SVG chart tooltips,
 * transaction filtering, AI advice carousel, and quick modals.
 */

(function () {
  'use strict';

  // Timeframe chart datasets
  const TIMEFRAME_DATA = {
    '6M': {
      inflow: '₹4,02,000',
      outflow: '₹1,77,810',
      net: '+₹2,24,190 (56%)',
      burn: '₹947/day'
    },
    'YTD': {
      inflow: '₹5,85,000',
      outflow: '₹2,64,300',
      net: '+₹3,20,700 (55%)',
      burn: '₹968/day'
    },
    '1Y': {
      inflow: '₹7,73,000',
      outflow: '₹3,78,610',
      net: '+₹3,94,390 (51%)',
      burn: '₹1,037/day'
    }
  };

  // Monthly values for SVG tooltip
  const MONTHLY_STATS = [
    { month: 'Apr', income: 62000, spend: 28500 },
    { month: 'May', income: 65000, spend: 31200 },
    { month: 'Jun', income: 65000, spend: 27800 },
    { month: 'Jul', income: 68000, spend: 34500 },
    { month: 'Aug', income: 68000, spend: 29400 },
    { month: 'Sep', income: 74000, spend: 28410 }
  ];

  // Smart Insights Carousel Dataset
  const INSIGHTS = [
    {
      content: `<p>Food spending is up <strong>22%</strong> this month, mostly from delivery orders on weekdays.</p><p>Cutting <strong>2 orders a week</strong> could save about <strong>₹1,800/month</strong> towards your Net Worth target.</p>`,
      actionText: '🎯 Set Food Budget Rule',
      actionToast: 'Food budget limit rule configured! Alert threshold set at ₹8,000.'
    },
    {
      content: `<p>You maintain <strong>₹1,45,000</strong> in secondary ICICI savings earning 2.70% p.a.</p><p>Activating <strong>Auto-Sweep FD linkage</strong> earns <strong>6.80% p.a. (+₹7,800/yr)</strong> with zero lock-in penalty.</p>`,
      actionText: '⚡ Enable Auto-Sweep Linkage',
      actionToast: 'Auto-Sweep linked to ICICI Savings! Estimated annual interest: +₹7,800.'
    },
    {
      content: `<p>You have <strong>₹45,000 remaining headroom</strong> under Section 80C before 31 March.</p><p>Allocating into <strong>ELSS Mutual Funds</strong> saves 30% direct tax while compounding capital.</p>`,
      actionText: '📈 Explore ELSS Tax-Savers',
      actionToast: 'Section 80C ELSS portfolio recommendations opened.'
    }
  ];

  let currentInsightIdx = 0;

  /**
   * Timeframe Selector
   */
  function initTimeframeSelector() {
    const tfButtons = document.querySelectorAll('.timeframe-selector .tf-btn');
    const summaryIncome = document.getElementById('summaryIncome');
    const summarySpend = document.getElementById('summarySpend');
    const summaryNet = document.getElementById('summaryNet');
    const summaryBurn = document.querySelector('.summary-pill:nth-child(4) .summary-value');

    tfButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tfButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tf = btn.getAttribute('data-timeframe');
        const data = TIMEFRAME_DATA[tf];
        if (!data) return;

        if (summaryIncome) summaryIncome.textContent = data.inflow;
        if (summarySpend) summarySpend.textContent = data.outflow;
        if (summaryNet) summaryNet.textContent = data.net;
        if (summaryBurn) summaryBurn.textContent = data.burn;

        // Subtle animation pulse
        const chartWrapper = document.getElementById('chartContainer');
        if (chartWrapper) {
          chartWrapper.style.opacity = '0.5';
          setTimeout(() => chartWrapper.style.opacity = '1', 180);
        }

        FinSight.showToast(`📊 Cashflow chart updated to ${tf} timeframe.`);
      });
    });
  }

  /**
   * SVG Chart Tooltips
   */
  function initChartTooltips() {
    const tooltip = document.getElementById('chartTooltip');
    const monthGroups = document.querySelectorAll('.chart-month-group');
    if (!tooltip || monthGroups.length === 0) return;

    monthGroups.forEach((group, idx) => {
      const stat = MONTHLY_STATS[idx];
      if (!stat) return;

      group.style.cursor = 'pointer';

      group.addEventListener('mouseenter', (e) => {
        const net = stat.income - stat.spend;
        tooltip.innerHTML = `
          <strong>${stat.month} 2026</strong><br>
          <span style="color:#10b981;">● Inflow: ${FinSight.formatINR(stat.income)}</span><br>
          <span style="color:#f43f5e;">● Outflow: ${FinSight.formatINR(stat.spend)}</span><br>
          <span style="color:#7c3aed;">★ Surplus: +${FinSight.formatINR(net)}</span>
        `;
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
        positionTooltip(e);
      });

      group.addEventListener('mousemove', positionTooltip);

      group.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
      });
    });

    function positionTooltip(e) {
      const container = document.getElementById('chartContainer');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      tooltip.style.left = `${Math.min(rect.width - 170, Math.max(10, x - 80))}px`;
      tooltip.style.top = `${Math.max(10, y - 75)}px`;
    }
  }

  /**
   * Recent Transactions Filter (All / Expense / Income)
   */
  function initTxFilters() {
    const filterButtons = document.querySelectorAll('.tx-header-actions .tx-filter-btn');
    const tableBody = document.getElementById('txTableBody');
    if (!tableBody || filterButtons.length === 0) return;

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        const rows = tableBody.querySelectorAll('.tx-item-row');

        rows.forEach(row => {
          const type = row.getAttribute('data-type');
          if (filter === 'all' || type === filter) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    });
  }

  /**
   * Smart Insights Carousel
   */
  function initInsightCarousel() {
    const prevBtn = document.getElementById('prevInsightBtn');
    const nextBtn = document.getElementById('nextInsightBtn');
    const counter = document.getElementById('insightCounter');
    const content = document.getElementById('insightContent');
    const actionBtn = document.getElementById('insightActionBtn');
    const actionText = document.getElementById('insightActionText');

    function updateInsight(index) {
      currentInsightIdx = (index + INSIGHTS.length) % INSIGHTS.length;
      const item = INSIGHTS[currentInsightIdx];

      if (content) {
        content.style.opacity = '0';
        setTimeout(() => {
          content.innerHTML = item.content;
          content.style.opacity = '1';
        }, 150);
      }

      if (counter) {
        counter.textContent = `${currentInsightIdx + 1} of ${INSIGHTS.length}`;
      }

      if (actionText) {
        actionText.textContent = item.actionText;
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => updateInsight(currentInsightIdx - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => updateInsight(currentInsightIdx + 1));

    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        const item = INSIGHTS[currentInsightIdx];
        FinSight.showToast(item.actionToast);
      });
    }
  }

  /**
   * Form Handlers: Set Goal & Add Transaction
   */
  function initForms() {
    // Goal Form
    const goalForm = document.getElementById('goalForm');
    if (goalForm) {
      goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('goalName').value.trim();
        const amount = Number(document.getElementById('goalAmount').value);
        const date = document.getElementById('goalDate').value;

        // Auto-detect category & icon based on keyword
        const nameLower = name.toLowerCase();
        let category = 'Savings Target';
        let icon = '🎯';
        let color = 'purple';

        if (nameLower.includes('car') || nameLower.includes('bike') || nameLower.includes('vehicle')) {
          category = 'Vehicle'; icon = '🚗'; color = 'teal';
        } else if (nameLower.includes('emergency') || nameLower.includes('fund') || nameLower.includes('reserve')) {
          category = 'Safety'; icon = '🛡️'; color = 'purple';
        } else if (nameLower.includes('trip') || nameLower.includes('vacation') || nameLower.includes('travel') || nameLower.includes('holiday')) {
          category = 'Travel'; icon = '🏝️'; color = 'pink';
        } else if (nameLower.includes('house') || nameLower.includes('home') || nameLower.includes('flat') || nameLower.includes('downpayment')) {
          category = 'Real Estate'; icon = '🏠'; color = 'teal';
        } else if (nameLower.includes('mac') || nameLower.includes('laptop') || nameLower.includes('phone') || nameLower.includes('tech')) {
          category = 'Work & Tech'; icon = '💻'; color = 'orange';
        }

        const newGoal = {
          id: 'goal-' + Date.now(),
          name: name,
          category: category,
          icon: icon,
          color: color,
          targetAmount: amount,
          currentAmount: 0,
          targetDate: date,
          createdDate: new Date().toISOString().split('T')[0],
          description: `Target set on ${new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`
        };

        FinSight.store.addGoal(newGoal);
        FinSight.closeModal('goalModal');
        FinSight.showToast(`🎯 Goal "${name}" (${FinSight.formatINR(amount)}) created! Track it on Goals page ➔`, 4500);
      });
    }

    // Transaction Form
    const txForm = document.getElementById('txForm');
    if (txForm) {
      txForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('txTitle').value.trim();
        const type = document.getElementById('txType').value;
        const category = document.getElementById('txCategory').value;
        const amount = Number(document.getElementById('txAmount').value);

        const isExpense = type === 'expense';
        const badgeClass = isExpense ? 'tx-badge-negative' : 'tx-badge-positive';
        const sign = isExpense ? '-' : '+';

        // Select category icon
        const iconMap = {
          Shopping: '🛒',
          Food: '🍔',
          Utilities: '⚡',
          Income: '💼',
          Entertainment: '🎬',
          Commute: '🚗'
        };
        const icon = iconMap[category] || '💸';

        // Prepend to recent transactions table
        const tableBody = document.getElementById('txTableBody');
        if (tableBody) {
          const tr = document.createElement('tr');
          tr.className = 'tx-item-row';
          tr.setAttribute('data-type', type);
          tr.innerHTML = `
            <td>
              <div class="tx-title-wrapper">
                <span class="tx-icon">${icon}</span>
                <div>
                  <span class="tx-name">${title}</span>
                  <span class="tx-date">Just now • Web Entry</span>
                </div>
              </div>
            </td>
            <td><span class="tx-category-tag">${category}</span></td>
            <td class="tx-amount-col">
              <span class="${badgeClass}">${sign}${FinSight.formatINR(amount)}</span>
            </td>
          `;
          tableBody.insertBefore(tr, tableBody.firstChild);
        }

        // Update Monthly Spend if expense
        if (isExpense) {
          const spendEl = document.getElementById('monthlySpendVal');
          if (spendEl) {
            const currentSpend = 28410; // base demo spend
            spendEl.textContent = FinSight.formatINR(currentSpend + amount);
          }
        }

        FinSight.closeModal('txModal');
        FinSight.showToast(`✅ Successfully logged ${FinSight.formatINR(amount)} for ${title}!`);
      });
    }
  }

  /**
   * Initialize on DOM ready
   */
  function initDashboard() {
    initTimeframeSelector();
    initChartTooltips();
    initTxFilters();
    initInsightCarousel();
    initForms();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
  } else {
    initDashboard();
  }

})();

