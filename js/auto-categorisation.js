/**
 * FinSight — Auto-Categorisation Engine Controller
 * Powers auto-categorisation.html: Interactive ML sandbox pattern simulator,
 * rule toggle switches, custom rule creation, and JSON rule export.
 */

(function () {
  'use strict';

  // Base classification rules dataset
  const activeRules = [
    {
      id: 'rule-food',
      name: 'Food & Dining Matcher',
      category: 'Food',
      icon: '🍔',
      keywords: ['zomato', 'swiggy', 'starbucks', "mcdonald's", 'dominos', 'burger', 'kfc', 'cafe', 'restaurant', 'subway', 'dine'],
      confidence: '99.8%',
      active: true,
      matches: 42
    },
    {
      id: 'rule-commute',
      name: 'Commute & Fuel Matcher',
      category: 'Commute',
      icon: '🚗',
      keywords: ['uber', 'ola', 'rapido', 'indian oil', 'fastag', 'metro', 'bharat petroleum', 'hpcl', 'fuel', 'toll'],
      confidence: '98.6%',
      active: true,
      matches: 28
    },
    {
      id: 'rule-shopping',
      name: 'Retail & Shopping Matcher',
      category: 'Shopping',
      icon: '🛒',
      keywords: ['amazon', 'flipkart', 'myntra', 'zara', 'nykaa', 'decathlon', 'ajio', 'tata cliq', 'retail'],
      confidence: '97.4%',
      active: true,
      matches: 31
    },
    {
      id: 'rule-utilities',
      name: 'Utilities & Telecom Matcher',
      category: 'Utilities',
      icon: '⚡',
      keywords: ['adani electricity', 'tata power', 'airtel', 'jio', 'billdesk', 'broadband', 'bescom', 'water bill', 'electricity'],
      confidence: '99.9%',
      active: true,
      matches: 19
    }
  ];

  /**
   * Interactive Sandbox Simulation
   */
  function runSandboxMatcher(text) {
    const resultEl = document.getElementById('sandboxResult');
    if (!resultEl) return;

    const query = text.trim().toLowerCase();
    if (!query) {
      resultEl.innerHTML = `
        <span>Predicted Category:</span>
        <span class="text-muted" style="color: var(--text-muted);">Type merchant string above to test...</span>
      `;
      return;
    }

    // Match against active rules
    let matchedRule = null;
    let matchedKeyword = '';

    for (const rule of activeRules) {
      if (!rule.active) continue;
      for (const kw of rule.keywords) {
        if (query.includes(kw.toLowerCase())) {
          matchedRule = rule;
          matchedKeyword = kw;
          break;
        }
      }
      if (matchedRule) break;
    }

    if (matchedRule) {
      resultEl.innerHTML = `
        <span>Predicted Category:</span>
        <strong class="positive-text" style="color: #059669;">
          ${matchedRule.icon} ${matchedRule.name.split(' Matcher')[0]} (${matchedRule.confidence} Match)
        </strong>
      `;
    } else {
      resultEl.innerHTML = `
        <span>Predicted Category:</span>
        <strong style="color: #f59e0b;">
          ❓ Uncategorised (Confidence < 80% — Human Review)
        </strong>
      `;
    }
  }

  function initSandbox() {
    const input = document.getElementById('sandboxInput');
    if (!input) return;

    input.addEventListener('input', (e) => {
      runSandboxMatcher(e.target.value);
    });

    // Run initial test
    runSandboxMatcher(input.value);
  }

  /**
   * Rule Toggle Switches
   */
  function initRuleToggles() {
    const toggleButtons = document.querySelectorAll('.rule-toggle');
    toggleButtons.forEach((btn, idx) => {
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', () => {
        const rule = activeRules[idx];
        if (!rule) return;

        rule.active = !rule.active;
        if (rule.active) {
          btn.textContent = 'Active';
          btn.classList.add('active');
          btn.style.background = 'rgba(16, 185, 129, 0.15)';
          btn.style.color = '#059669';
          FinSight.showToast(`Active: ${rule.name} enabled for live incoming transactions.`);
        } else {
          btn.textContent = 'Paused';
          btn.classList.remove('active');
          btn.style.background = 'rgba(148, 163, 184, 0.2)';
          btn.style.color = '#64748b';
          FinSight.showToast(`Paused: ${rule.name} temporarily suspended.`);
        }

        // Re-run sandbox with current state
        const input = document.getElementById('sandboxInput');
        if (input) runSandboxMatcher(input.value);
      });
    });
  }

  /**
   * Custom Rule Builder Form
   */
  function initRuleForm() {
    const form = document.getElementById('ruleForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const keywordInput = document.getElementById('ruleKeyword');
      const categorySelect = document.getElementById('ruleCategory');
      const confSlider = document.getElementById('ruleConfidence');

      const rawKeywords = keywordInput ? keywordInput.value.trim() : '';
      const category = categorySelect ? categorySelect.value : 'General';
      const confidence = confSlider ? `${confSlider.value}.0%` : '95.0%';

      if (!rawKeywords) return;

      const keywordsList = rawKeywords.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

      // Icon map
      const iconMap = {
        Health: '🏥',
        Food: '🍔',
        Shopping: '🛒',
        Utilities: '⚡',
        Commute: '🚗',
        Entertainment: '🎬'
      };
      const icon = iconMap[category] || '🏷️';
      const name = `${category} Pattern Matcher`;

      const newRule = {
        id: `rule-${Date.now()}`,
        name: name,
        category: category,
        icon: icon,
        keywords: keywordsList,
        confidence: confidence,
        active: true,
        matches: 0
      };

      activeRules.push(newRule);

      // Append card into rules container
      const container = document.querySelector('.rules-list-container');
      if (container) {
        const item = document.createElement('div');
        item.className = 'rule-card-item';
        item.innerHTML = `
          <div class="rule-header-row">
            <div class="rule-title-group">
              <span class="rule-icon">${icon}</span>
              <div>
                <strong>${name}</strong>
                <span class="rule-pattern">Contains: ${rawKeywords}</span>
              </div>
            </div>
            <span class="tx-category-tag">${category}</span>
          </div>
          <div class="rule-stats-bar">
            <span>Matched: 0 transactions</span>
            <span class="success-text">Confidence: ${confidence}</span>
            <span class="rule-toggle active" style="cursor: pointer;">Active</span>
          </div>
        `;

        const newToggle = item.querySelector('.rule-toggle');
        newToggle.addEventListener('click', () => {
          newRule.active = !newRule.active;
          newToggle.textContent = newRule.active ? 'Active' : 'Paused';
          newToggle.style.color = newRule.active ? '#059669' : '#64748b';
          const input = document.getElementById('sandboxInput');
          if (input) runSandboxMatcher(input.value);
        });

        container.appendChild(item);
      }

      // Update KPI
      const kpiRules = document.querySelector('.card-purple .card-value');
      if (kpiRules) {
        kpiRules.textContent = `${activeRules.length + 14} Rules`;
      }

      form.reset();
      const confVal = document.getElementById('confVal');
      if (confVal) confVal.textContent = '95%';

      FinSight.showToast(`🪄 Added custom rule for [${rawKeywords}]!`, 4000);

      // Test sandbox with first keyword
      const input = document.getElementById('sandboxInput');
      if (input && keywordsList.length > 0) {
        input.value = `${keywordsList[0]} store purchase`;
        runSandboxMatcher(input.value);
      }
    });
  }

  /**
   * Export Rules Button
   */
  function initExportRules() {
    const exportBtn = document.querySelector('.top-actions .btn-secondary');
    if (!exportBtn) return;

    exportBtn.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeRules, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `finsight-categorisation-rules.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      FinSight.showToast('📋 Exported ML classification rules JSON file.');
    });
  }

  function init() {
    initSandbox();
    initRuleToggles();
    initRuleForm();
    initExportRules();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

