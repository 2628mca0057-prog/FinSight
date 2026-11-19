/**
 * FinSight — Smart Insights Controller
 * Powers insights.html: Automated financial advisory, one-click auto-optimization,
 * interactive action triggers, and alert rules management.
 */

(function () {
  'use strict';

  /**
   * One-Click "Auto-Optimize"
   */
  function initAutoOptimize() {
    const autoApplyBtn = document.getElementById('autoApplyBtn');
    if (!autoApplyBtn) return;

    autoApplyBtn.addEventListener('click', () => {
      autoApplyBtn.disabled = true;
      autoApplyBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Optimizing...</span>';

      setTimeout(() => {
        const cards = document.querySelectorAll('.insight-feed-card');
        cards.forEach((card, idx) => {
          setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.borderColor = '#10b981';
            const actions = card.querySelector('.feed-card-actions');
            if (actions) {
              actions.innerHTML = `
                <span style="color: #059669; font-weight: 700; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                  ✓ Recommendation Automatically Applied & Active
                </span>
              `;
            }
          }, idx * 120);
        });

        // Update KPI card
        const potentialSavingsEl = document.querySelector('.card-purple .card-value');
        if (potentialSavingsEl) {
          potentialSavingsEl.innerHTML = '<span style="color: #10b981;">₹32,400 Unlocked!</span>';
        }

        autoApplyBtn.disabled = false;
        autoApplyBtn.innerHTML = '<span class="btn-icon">✓</span><span>All Optimized</span>';
        autoApplyBtn.style.background = '#059669';

        FinSight.showToast('🎉 All 4 financial optimizations applied! Projected savings: +₹32,400/yr.', 4500);
      }, 700);
    });
  }

  /**
   * Alert Rules Button
   */
  function initAlertRules() {
    const rulesBtn = document.getElementById('rulesBtn');
    if (!rulesBtn) return;

    rulesBtn.addEventListener('click', () => {
      FinSight.showToast('⚙️ Alert Rules: 4 active anomaly triggers monitored in real time.', 3000);
    });
  }

  /**
   * Individual Card Buttons Handlers
   */
  function initCardActions() {
    const cards = document.querySelectorAll('.insight-feed-card');

    cards.forEach((card, index) => {
      const primaryBtn = card.querySelector('.feed-card-actions .btn-primary');
      const secondaryBtn = card.querySelector('.feed-card-actions .btn-secondary');

      if (primaryBtn) {
        primaryBtn.addEventListener('click', () => {
          primaryBtn.disabled = true;
          primaryBtn.textContent = '✓ Configured & Active';
          primaryBtn.style.background = '#059669';
          primaryBtn.style.borderColor = '#059669';

          if (index === 0) {
            FinSight.showToast('🎯 Food delivery cap set to ₹8,000/mo. Saved orders channeled to liquid cash!');
          } else if (index === 1) {
            FinSight.showToast('⚡ Auto-Sweep FD activated on ICICI Account! Now earning 6.80% p.a.');
          } else if (index === 2) {
            FinSight.showToast('🔍 Reviewing active mandates: 2 dormant streaming subscriptions paused (+₹949/mo).');
          } else if (index === 3) {
            FinSight.showToast('📈 Section 80C ELSS portfolio allocation saved to Q4 investment plan!');
          }
        });
      }

      if (secondaryBtn) {
        secondaryBtn.addEventListener('click', () => {
          if (secondaryBtn.textContent.includes('Dismiss')) {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '0';
            card.style.transform = 'translateX(20px)';
            setTimeout(() => card.remove(), 300);
            FinSight.showToast('Insight dismissed for this billing cycle.');
          } else if (secondaryBtn.textContent.includes('Bookmark')) {
            secondaryBtn.textContent = '★ Bookmarked';
            secondaryBtn.style.color = '#7c3aed';
            FinSight.showToast('★ Bookmarked for Q4 tax-saving planning window.');
          } else {
            FinSight.showToast('Reminder scheduled.');
          }
        });
      }
    });
  }

  function init() {
    initAutoOptimize();
    initAlertRules();
    initCardActions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

