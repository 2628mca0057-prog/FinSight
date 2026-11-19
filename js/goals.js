/**
 * FinSight — Financial Goals & Savings Tracker Controller
 * Powers goals.html: Real-time goal progress tracking, interactive fund allocations,
 * milestone pace simulation, and LocalStorage persistence.
 */

(function () {
  'use strict';

  let currentFilter = 'all';
  const elements = {};

  const CATEGORY_ICONS = {
    'Safety': { icon: '🛡️', color: 'purple' },
    'Vehicle': { icon: '🚗', color: 'teal' },
    'Travel': { icon: '🏝️', color: 'pink' },
    'Real Estate': { icon: '🏠', color: 'teal' },
    'Work & Tech': { icon: '💻', color: 'orange' },
    'Education': { icon: '🎓', color: 'blue' },
    'Retirement': { icon: '🪙', color: 'purple' },
    'Custom': { icon: '🎯', color: 'purple' }
  };

  function cacheElements() {
    elements.goalsGrid = document.getElementById('goalsGrid');
    elements.kpiTotalTarget = document.getElementById('kpiTotalTarget');
    elements.kpiTargetSub = document.getElementById('kpiTargetSub');
    elements.kpiTotalSaved = document.getElementById('kpiTotalSaved');
    elements.kpiProgressPct = document.getElementById('kpiProgressPct');
    elements.kpiMonthlyPace = document.getElementById('kpiMonthlyPace');
    elements.kpiGoalsOnTrack = document.getElementById('kpiGoalsOnTrack');
    elements.kpiEarliestMilestone = document.getElementById('kpiEarliestMilestone');

    elements.filterButtons = document.querySelectorAll('[data-goal-filter]');
    elements.openGoalModalBtn = document.getElementById('openGoalModalBtn');
    elements.allocateQuickBtn = document.getElementById('allocateQuickBtn');
    elements.goalForm = document.getElementById('goalForm');
    elements.goalModalTitle = document.getElementById('goalModalTitle');
    elements.editGoalId = document.getElementById('editGoalId');

    elements.allocateForm = document.getElementById('allocateForm');
    elements.allocateGoalSelect = document.getElementById('allocateGoalSelect');
    elements.allocateAmount = document.getElementById('allocateAmount');
    elements.allocateSourceAccount = document.getElementById('allocateSourceAccount');

    elements.goalContribsList = document.getElementById('goalContribsList');
    elements.clearContribsBtn = document.getElementById('clearContribsBtn');

    // Simulator
    elements.simGoalSelect = document.getElementById('simGoalSelect');
    elements.simSlider = document.getElementById('simSlider');
    elements.simPaceVal = document.getElementById('simPaceVal');
    elements.simProjectedDate = document.getElementById('simProjectedDate');
    elements.simComparisonText = document.getElementById('simComparisonText');
  }

  /**
   * Helper: Calculate days between now and target date
   */
  function calculateDaysLeft(targetDateStr) {
    if (!targetDateStr) return 0;
    const target = new Date(targetDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Render KPI summary metrics
   */
  function renderKPIs(goals) {
    let totalTarget = 0;
    let totalSaved = 0;
    let onTrackCount = 0;
    let earliestDate = null;

    goals.forEach(g => {
      totalTarget += (g.targetAmount || 0);
      totalSaved += (g.currentAmount || 0);

      const days = calculateDaysLeft(g.targetDate);
      const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
      if (pct >= 100 || (days > 0 && pct >= 40)) {
        onTrackCount++;
      }

      if (g.targetDate && days > 0) {
        const d = new Date(g.targetDate);
        if (!earliestDate || d < earliestDate) earliestDate = d;
      }
    });

    const completionRate = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0;

    if (elements.kpiTotalTarget) elements.kpiTotalTarget.textContent = FinSight.formatINR(totalTarget);
    if (elements.kpiTargetSub) elements.kpiTargetSub.textContent = `Across ${goals.length} active milestone${goals.length === 1 ? '' : 's'}`;

    if (elements.kpiTotalSaved) elements.kpiTotalSaved.textContent = FinSight.formatINR(totalSaved);
    if (elements.kpiProgressPct) {
      elements.kpiProgressPct.textContent = `▲ ${completionRate}% aggregate completion`;
    }

    if (elements.kpiGoalsOnTrack) {
      elements.kpiGoalsOnTrack.textContent = `${onTrackCount} / ${goals.length} On Schedule`;
    }

    if (elements.kpiEarliestMilestone) {
      if (earliestDate) {
        const monthYear = earliestDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        elements.kpiEarliestMilestone.textContent = `Earliest: ${monthYear}`;
      } else {
        elements.kpiEarliestMilestone.textContent = 'All Completed 🎉';
      }
    }
  }

  /**
   * Render Goals Grid Showcase
   */
  function renderGoalsGrid(goals) {
    if (!elements.goalsGrid) return;
    elements.goalsGrid.innerHTML = '';

    const filtered = goals.filter(g => {
      const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
      if (currentFilter === 'active') return pct < 100;
      if (currentFilter === 'completed') return pct >= 100;
      return true;
    });

    if (filtered.length === 0) {
      elements.goalsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #ffffff; border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
          <span style="font-size: 36px; display: block; margin-bottom: 8px;">🎯</span>
          <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main);">No goals found in this view</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin: 6px 0 16px;">Set your next savings milestone or adjust active filters above.</p>
          <button type="button" class="btn btn-primary" onclick="FinSight.openModal('goalModal')">+ Define New Goal</button>
        </div>
      `;
      return;
    }

    filtered.forEach(goal => {
      const target = goal.targetAmount || 1;
      const current = goal.currentAmount || 0;
      const pct = Math.min(100, Math.round((current / target) * 100));
      const remaining = Math.max(0, target - current);
      const isCompleted = pct >= 100;

      const daysLeft = calculateDaysLeft(goal.targetDate);
      const monthsLeft = Math.max(1, Math.round(daysLeft / 30.4));
      const monthlyNeeded = Math.round(remaining / monthsLeft);

      // Status Badge
      let statusClass = 'on-track';
      let statusText = 'On Track ✓';
      if (isCompleted) {
        statusClass = 'completed';
        statusText = 'Completed 🎉';
      } else if (daysLeft < 45 && pct < 60) {
        statusClass = 'needs-boost';
        statusText = 'Needs Boost ⚠️';
      }

      const color = goal.color || 'purple';
      const icon = goal.icon || '🎯';

      const card = document.createElement('div');
      card.className = `goal-card ${isCompleted ? 'completed' : ''}`;
      card.setAttribute('data-goal-id', goal.id);

      // Card Header
      const cardTop = `
        <div class="goal-card-top">
          <div class="goal-title-group">
            <div class="goal-icon-bubble goal-icon-${color}">${icon}</div>
            <div class="goal-info">
              <h3>${goal.name}</h3>
              <span class="goal-category-tag">${goal.category || 'Savings Target'}</span>
            </div>
          </div>
          <span class="goal-status-badge ${statusClass}">${statusText}</span>
        </div>
      `;

      // Progress Block
      const progressBlock = `
        <div class="goal-progress-section">
          <div class="goal-progress-row">
            <div>
              <span class="goal-saved-val">${FinSight.formatINR(current)}</span>
              <span class="goal-target-val"> of ${FinSight.formatINR(target)}</span>
            </div>
            <span class="goal-pct-badge">${pct}%</span>
          </div>
          <div class="goal-progress-bar-bg">
            <div class="goal-progress-fill fill-${color}" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;

      // Meta Stats Grid
      const targetDateFormatted = goal.targetDate ? new Date(goal.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible';
      const metaRow = `
        <div class="goal-meta-grid">
          <div class="goal-meta-item">
            <span>Target Deadline</span>
            <strong>${targetDateFormatted} (${isCompleted ? 'Done' : `${daysLeft}d left`})</strong>
          </div>
          <div class="goal-meta-item">
            <span>Monthly Run-Rate</span>
            <strong>${isCompleted ? 'Achieved ✨' : `${FinSight.formatINR(monthlyNeeded)}/mo needed`}</strong>
          </div>
        </div>
      `;

      // Actions Footer
      const actionsFooter = `
        <div class="goal-card-actions">
          <button type="button" class="btn-add-funds" data-action="allocate" data-id="${goal.id}">
            <span>⚡ Allocate Funds</span>
          </button>
          <button type="button" class="btn-icon-action" data-action="edit" data-id="${goal.id}" title="Edit Goal Details">
            ✎
          </button>
          <button type="button" class="btn-icon-action delete-action" data-action="delete" data-id="${goal.id}" title="Delete Milestone">
            🗑️
          </button>
        </div>
      `;

      card.innerHTML = cardTop + progressBlock + metaRow + actionsFooter;

      // Event bindings
      card.querySelector('[data-action="allocate"]').addEventListener('click', () => openAllocateModalForGoal(goal.id));
      card.querySelector('[data-action="edit"]').addEventListener('click', () => openEditGoalModal(goal));
      card.querySelector('[data-action="delete"]').addEventListener('click', () => confirmDeleteGoal(goal.id, goal.name));

      elements.goalsGrid.appendChild(card);
    });
  }

  /**
   * Render Recent Contributions Activity Log
   */
  function renderContributions() {
    if (!elements.goalContribsList) return;
    elements.goalContribsList.innerHTML = '';

    const list = FinSight.store.getGoalContributions();
    if (list.length === 0) {
      elements.goalContribsList.innerHTML = `
        <div class="empty-transfers-hint">No goal contributions recorded yet. Use "Allocate Funds" to add money towards targets!</div>
      `;
      return;
    }

    list.slice(0, 5).forEach(c => {
      const item = document.createElement('div');
      item.className = 'transfer-history-item';
      item.innerHTML = `
        <div class="transfer-item-left">
          <div class="transfer-item-icon">🎯</div>
          <div>
            <div class="transfer-item-route">${c.goalName}</div>
            <div class="transfer-item-meta">${c.date} • from ${c.account}</div>
          </div>
        </div>
        <div class="transfer-item-right">
          <div class="transfer-item-amount positive-text" style="color: #059669;">+${FinSight.formatINR(c.amount)}</div>
          <span class="transfer-item-status">Allocated</span>
        </div>
      `;
      elements.goalContribsList.appendChild(item);
    });
  }

  /**
   * Populate Dropdowns
   */
  function updateDropdowns(goals) {
    if (elements.allocateGoalSelect) {
      elements.allocateGoalSelect.innerHTML = '';
      goals.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        const current = g.currentAmount || 0;
        opt.textContent = `${g.name} (${FinSight.formatINR(current)} / ${FinSight.formatINR(g.targetAmount)})`;
        elements.allocateGoalSelect.appendChild(opt);
      });
    }

    if (elements.simGoalSelect) {
      const currentSelected = elements.simGoalSelect.value;
      elements.simGoalSelect.innerHTML = '';
      goals.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = g.name;
        elements.simGoalSelect.appendChild(opt);
      });
      if (goals.some(g => g.id === currentSelected)) {
        elements.simGoalSelect.value = currentSelected;
      }
    }
  }

  /**
   * Milestone Simulator Handler
   */
  function updateSimulator() {
    if (!elements.simGoalSelect || !elements.simSlider) return;

    const goalId = elements.simGoalSelect.value;
    const monthlyAllocation = Number(elements.simSlider.value);
    const goals = FinSight.store.getGoals();
    const goal = goals.find(g => g.id === goalId) || goals[0];

    if (elements.simPaceVal) {
      elements.simPaceVal.textContent = `${FinSight.formatINR(monthlyAllocation)} / mo`;
    }

    if (!goal) return;

    const remaining = Math.max(0, goal.targetAmount - (goal.currentAmount || 0));
    if (remaining === 0) {
      if (elements.simProjectedDate) elements.simProjectedDate.textContent = 'Milestone Already Achieved! 🎉';
      if (elements.simComparisonText) elements.simComparisonText.textContent = '100% of target capital reached.';
      return;
    }

    const monthsRequired = Math.ceil(remaining / monthlyAllocation);
    const projDate = new Date();
    projDate.setMonth(projDate.getMonth() + monthsRequired);
    const projDateStr = projDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    if (elements.simProjectedDate) {
      elements.simProjectedDate.textContent = `Estimated: ${projDateStr} (${monthsRequired} month${monthsRequired === 1 ? '' : 's'})`;
    }

    if (elements.simComparisonText) {
      if (goal.targetDate) {
        const targetD = new Date(goal.targetDate);
        const diffMonths = Math.round((targetD - projDate) / (1000 * 60 * 60 * 24 * 30.4));
        if (diffMonths > 0) {
          elements.simComparisonText.textContent = `🚀 Reaches milestone ${diffMonths} month${diffMonths === 1 ? '' : 's'} ahead of target deadline!`;
          elements.simComparisonText.style.color = '#059669';
        } else if (diffMonths < 0) {
          elements.simComparisonText.textContent = `⚠️ Falls ${Math.abs(diffMonths)} month${Math.abs(diffMonths) === 1 ? '' : 's'} behind deadline. Consider increasing allocation pace.`;
          elements.simComparisonText.style.color = '#d97706';
        } else {
          elements.simComparisonText.textContent = `🎯 Spot on! Matches your planned deadline perfectly.`;
          elements.simComparisonText.style.color = 'var(--text-secondary)';
        }
      }
    }
  }

  /**
   * Modal: Open Allocate Modal for a specific Goal
   */
  function openAllocateModalForGoal(goalId) {
    if (elements.allocateGoalSelect) {
      elements.allocateGoalSelect.value = goalId;
    }
    if (elements.allocateAmount) {
      elements.allocateAmount.value = '5000';
    }
    FinSight.openModal('allocateModal');
  }

  /**
   * Modal: Open Edit Goal
   */
  function openEditGoalModal(goal) {
    if (elements.goalModalTitle) elements.goalModalTitle.textContent = '✎ Edit Financial Goal';
    if (elements.editGoalId) elements.editGoalId.value = goal.id;

    document.getElementById('goalName').value = goal.name || '';
    document.getElementById('goalCategory').value = goal.category || 'Safety';
    document.getElementById('goalDate').value = goal.targetDate || '';
    document.getElementById('goalAmount').value = goal.targetAmount || '';
    document.getElementById('goalCurrentAmount').value = goal.currentAmount || 0;
    document.getElementById('goalDesc').value = goal.description || '';

    FinSight.openModal('goalModal');
  }

  /**
   * Delete Goal confirmation
   */
  function confirmDeleteGoal(id, name) {
    if (confirm(`Are you sure you want to remove the milestone "${name}"?`)) {
      FinSight.store.deleteGoal(id);
      refreshAll();
      FinSight.showToast(`Milestone "${name}" removed.`);
    }
  }

  /**
   * Filter Buttons Handler
   */
  function initFilterButtons() {
    if (!elements.filterButtons) return;
    elements.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-goal-filter') || 'all';
        const goals = FinSight.store.getGoals();
        renderGoalsGrid(goals);
      });
    });
  }

  /**
   * Form: Save Goal
   */
  function initGoalForm() {
    if (!elements.goalForm) return;

    elements.goalForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const editId = elements.editGoalId.value;
      const name = document.getElementById('goalName').value.trim();
      const category = document.getElementById('goalCategory').value;
      const targetDate = document.getElementById('goalDate').value;
      const targetAmount = Number(document.getElementById('goalAmount').value);
      const currentAmount = Number(document.getElementById('goalCurrentAmount').value) || 0;
      const desc = document.getElementById('goalDesc').value.trim();

      const catMeta = CATEGORY_ICONS[category] || { icon: '🎯', color: 'purple' };

      if (editId) {
        FinSight.store.updateGoal(editId, {
          name,
          category,
          icon: catMeta.icon,
          color: catMeta.color,
          targetDate,
          targetAmount,
          currentAmount,
          description: desc
        });
        FinSight.showToast(`✓ Updated goal details for "${name}"!`);
      } else {
        const newGoal = {
          id: 'goal-' + Date.now(),
          name,
          category,
          icon: catMeta.icon,
          color: catMeta.color,
          targetAmount,
          currentAmount,
          targetDate,
          createdDate: new Date().toISOString().split('T')[0],
          description: desc || 'Custom target milestone'
        };
        FinSight.store.addGoal(newGoal);
        FinSight.showToast(`🎯 New goal "${name}" created! Target: ${FinSight.formatINR(targetAmount)}`);
      }

      FinSight.closeModal('goalModal');
      refreshAll();
    });

    if (elements.openGoalModalBtn) {
      elements.openGoalModalBtn.addEventListener('click', () => {
        if (elements.goalModalTitle) elements.goalModalTitle.textContent = '🎯 Define Financial Goal';
        if (elements.editGoalId) elements.editGoalId.value = '';
        if (elements.goalForm) elements.goalForm.reset();
        FinSight.openModal('goalModal');
      });
    }
  }

  /**
   * Form: Allocate Funds
   */
  function initAllocateForm() {
    if (!elements.allocateForm) return;

    elements.allocateForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const goalId = elements.allocateGoalSelect.value;
      const amount = Number(elements.allocateAmount.value);
      const accountName = elements.allocateSourceAccount.value;

      if (!amount || amount < 500) {
        FinSight.showToast('⚠️ Minimum allocation amount is ₹500.');
        return;
      }

      const updated = FinSight.store.addFundsToGoal(goalId, amount, accountName);
      if (updated) {
        FinSight.closeModal('allocateModal');
        refreshAll();

        const card = document.querySelector(`[data-goal-id="${goalId}"]`);
        if (card) {
          card.classList.add('card-pulse');
          setTimeout(() => card.classList.remove('card-pulse'), 1200);
        }

        const pct = Math.min(100, Math.round((updated.currentAmount / updated.targetAmount) * 100));
        FinSight.showToast(`⚡ Deposited ${FinSight.formatINR(amount)} into "${updated.name}"! Now ${pct}% complete.`, 4500);
      }
    });

    if (elements.allocateQuickBtn) {
      elements.allocateQuickBtn.addEventListener('click', () => {
        FinSight.openModal('allocateModal');
      });
    }

    // Quick chips
    const chips = document.querySelectorAll('[data-alloc-preset]');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const addAmt = Number(chip.getAttribute('data-alloc-preset')) || 0;
        const current = Number(elements.allocateAmount.value) || 0;
        elements.allocateAmount.value = current + addAmt;
      });
    });
  }

  /**
   * Clear contributions history
   */
  function initClearContribs() {
    if (!elements.clearContribsBtn) return;
    elements.clearContribsBtn.addEventListener('click', () => {
      if (confirm('Clear the goal contributions history log?')) {
        FinSight.store.saveGoalContributions([]);
        renderContributions();
        FinSight.showToast('Goal contributions log cleared.');
      }
    });
  }

  /**
   * Central Refresh
   */
  function refreshAll() {
    const goals = FinSight.store.getGoals();
    renderKPIs(goals);
    renderGoalsGrid(goals);
    renderContributions();
    updateDropdowns(goals);
    updateSimulator();
    FinSight.updateNavBadges();
  }

  function init() {
    cacheElements();
    initFilterButtons();
    initGoalForm();
    initAllocateForm();
    initClearContribs();

    if (elements.simGoalSelect) elements.simGoalSelect.addEventListener('change', updateSimulator);
    if (elements.simSlider) elements.simSlider.addEventListener('input', updateSimulator);

    refreshAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

