/**
 * FinSight — Analytics & Intelligence Controller
 * Powers analytics.html: 12-Month trajectory analysis, timeframe switching,
 * chart tooltip inspections, report generation, and velocity benchmarks.
 */

(function () {
  'use strict';

  // 12-Month Historical Trajectory Data
  const MONTHLY_TRAJECTORY = [
    { month: 'Oct 2025', inflow: 62000, outflow: 32000 },
    { month: 'Nov 2025', inflow: 64000, outflow: 31000 },
    { month: 'Dec 2025', inflow: 78000, outflow: 42000 },
    { month: 'Jan 2026', inflow: 62000, outflow: 28000 },
    { month: 'Feb 2026', inflow: 65000, outflow: 29500 },
    { month: 'Mar 2026', inflow: 65000, outflow: 27800 },
    { month: 'Apr 2026', inflow: 68000, outflow: 34500 },
    { month: 'May 2026', inflow: 68000, outflow: 30000 },
    { month: 'Jun 2026', inflow: 65000, outflow: 27800 },
    { month: 'Jul 2026', inflow: 68000, outflow: 34500 },
    { month: 'Aug 2026', inflow: 68000, outflow: 29400 },
    { month: 'Sep 2026', inflow: 74000, outflow: 28410 }
  ];

  const TIMEFRAME_STATS = {
    '1Y': {
      inflow: '₹7,73,000',
      outflow: '₹3,78,610',
      net: '+₹3,94,390 (51.0%)'
    },
    'YTD': {
      inflow: '₹5,85,000',
      outflow: '₹2,64,300',
      net: '+₹3,20,700 (54.8%)'
    },
    '6M': {
      inflow: '₹4,02,000',
      outflow: '₹1,77,810',
      net: '+₹2,24,190 (55.8%)'
    }
  };

  /**
   * Timeframe Selector
   */
  function initTimeframe() {
    const tfButtons = document.querySelectorAll('.timeframe-selector .tf-btn');
    const summaryPills = document.querySelectorAll('.chart-summary-bar .summary-value');

    tfButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tfButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tf = btn.getAttribute('data-timeframe');
        const stats = TIMEFRAME_STATS[tf];
        if (stats && summaryPills.length >= 3) {
          summaryPills[0].textContent = stats.inflow;
          summaryPills[1].textContent = stats.outflow;
          summaryPills[2].textContent = stats.net;

          const chartWrapper = document.getElementById('chartContainer');
          if (chartWrapper) {
            chartWrapper.style.opacity = '0.5';
            setTimeout(() => chartWrapper.style.opacity = '1', 180);
          }

          FinSight.showToast(`📈 Analytics trajectory updated to ${tf} scope.`);
        }
      });
    });
  }

  /**
   * SVG Chart Hover Tooltip
   */
  function initTrajectoryTooltip() {
    const container = document.getElementById('chartContainer');
    if (!container) return;

    // Create tooltip element
    let tooltip = document.getElementById('chartTooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'chartTooltip';
      tooltip.className = 'chart-tooltip';
      container.parentElement.appendChild(tooltip);
    }

    const svg = container.querySelector('svg');
    if (!svg) return;

    // Months label texts
    const monthTexts = svg.querySelectorAll('g[font-size="11"][text-anchor="middle"] text');

    monthTexts.forEach((textNode, idx) => {
      textNode.style.cursor = 'pointer';
      const stat = MONTHLY_TRAJECTORY[idx];
      if (!stat) return;

      textNode.addEventListener('mouseenter', (e) => {
        const surplus = stat.inflow - stat.outflow;
        tooltip.innerHTML = `
          <strong>${stat.month}</strong><br>
          <span style="color:#059669;">● Gross Inflow: ${FinSight.formatINR(stat.inflow)}</span><br>
          <span style="color:#e11d48;">● Total Outflow: ${FinSight.formatINR(stat.outflow)}</span><br>
          <span style="color:#7c3aed;">★ Capital Retained: +${FinSight.formatINR(surplus)}</span>
        `;
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
        positionTooltip(e);
      });

      textNode.addEventListener('mousemove', positionTooltip);
      textNode.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
      });
    });

    function positionTooltip(e) {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      tooltip.style.left = `${Math.min(rect.width - 180, Math.max(10, x - 85))}px`;
      tooltip.style.top = `${Math.max(10, y - 80)}px`;
    }
  }

  /**
   * Download Annual Report
   */
  function initReportDownload() {
    const downloadBtn = document.getElementById('downloadReportBtn');
    if (!downloadBtn) return;

    downloadBtn.addEventListener('click', () => {
      FinSight.showToast('📄 Preparing FinSight Comprehensive Wealth & Analytics Report...');

      setTimeout(() => {
        const reportContent = `
========================================================================
            FINSIGHT — ANNUAL WEALTH & CASHFLOW AUDIT (FY 2026-27)
========================================================================
Report Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Account Holder: Nikhil Tyagi (Pro Member)

1. FINANCIAL HEALTH SCORECARD
------------------------------------------------------------------------
- Financial Health Score: 88 / 100 (Top 5% of Savers)
- Debt-to-Income Ratio:   2.5% (Very Safe, Benchmark < 30%)
- Emergency Cash Runway:  15.1 Months (Total Liquid: ₹4,29,500)
- Average Monthly Savings: ₹35,070 / month (54.4% Savings Efficiency)
- Annual Wealth Delta:    +₹1,24,000 (+17.2% YoY Compounding)
- Projected Corpus:       ₹9,85,000 (Target: ₹10,00,000 by Dec 2026)

2. ANNUAL INFLOW VS OUTFLOW SUMMARY
------------------------------------------------------------------------
- Gross Annual Inflow:    ₹7,73,000.00
- Total Annual Outflow:   ₹3,78,610.00
- Net Capital Retained:   ₹3,94,390.00 (51.0% Capital Retention)

3. CATEGORY EXPENDITURE BREAKDOWN
------------------------------------------------------------------------
- Food & Dining:          ₹9,420 (33.2%) [Attention: 117% of Target]
- Shopping & Retail:      ₹7,850 (27.6%)
- Utilities & Bills:      ₹4,140 (14.6%)
- Commute & Fuel:         ₹3,150 (11.1%)
- Health & Fitness:       ₹2,001 (7.0%)
- Entertainment:          ₹1,849 (6.5%)

4. ASSET ALLOCATION & LIQUIDITY
------------------------------------------------------------------------
- Equity & Demat (Zerodha): ₹4,12,800 (49%) • +18.4% Return
- Liquid Cash (HDFC/ICICI): ₹4,29,500 (51%)
- Active Section 80C Headroom: ₹45,000 available (Save up to ₹13,500 Tax)

========================================================================
FinSight Intelligence Engine • Verified Bank-Grade Sync • End of Report
========================================================================
        `.trim();

        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FinSight-Annual-Audit-Report-2026.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        FinSight.showToast('✅ Annual Financial Report downloaded successfully!');
      }, 700);
    });
  }

  /**
   * Adjust Targets Modal / Prompt
   */
  function initAdjustTargets() {
    const setGoalBtn = document.getElementById('setGoalBtn');
    if (!setGoalBtn) return;

    setGoalBtn.addEventListener('click', () => {
      const currentCorpus = 985000;
      const target = prompt('Enter your target portfolio milestone for Dec 2026 (₹):', currentCorpus);
      if (target && !isNaN(Number(target))) {
        const val = Number(target);
        const corpusCard = document.querySelector('.card-orange .card-value');
        if (corpusCard) {
          corpusCard.textContent = FinSight.formatINR(val);
        }
        FinSight.showToast(`🎯 Portfolio target milestone updated to ${FinSight.formatINR(val)}!`);
      }
    });
  }

  /**
   * Velocity item cards click
   */
  function initVelocityItems() {
    const items = document.querySelectorAll('.velocity-item');
    items.forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        const label = item.querySelector('.velocity-label')?.textContent || '';
        const val = item.querySelector('.velocity-value')?.textContent || '';
        FinSight.showToast(`📊 ${label}: ${val}`);
      });
    });
  }

  function init() {
    initTimeframe();
    initTrajectoryTooltip();
    initReportDownload();
    initAdjustTargets();
    initVelocityItems();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

