/**
 * FinSight — Core Architecture & Shared Services
 * Provides unified state management, currency formatters,
 * accessible modal handling, and toast notifications across all pages.
 */

(function (window, document) {
  'use strict';

  // Storage Keys
  const STORAGE_KEYS = {
    TRANSACTIONS: 'finsight_transactions_v1',
    ACCOUNTS: 'finsight_accounts_v1',
    RULES: 'finsight_rules_v1',
    GOALS: 'finsight_goals_v1',
    GOAL_CONTRIBUTIONS: 'finsight_goal_contribs_v1',
    TRANSFERS: 'finsight_transfers_v1'
  };

  // Default Seed Goals
  const DEFAULT_GOALS = [
    {
      id: 'goal-emergency',
      name: 'Emergency Fund (6 Months)',
      category: 'Safety',
      icon: '🛡️',
      color: 'purple',
      targetAmount: 200000,
      currentAmount: 145000,
      targetDate: '2027-03-31',
      createdDate: '2026-06-01',
      description: 'Liquid cash reserve for medical or emergency runway'
    },
    {
      id: 'goal-car',
      name: 'New Electric Car (Tata Curvv.ev)',
      category: 'Vehicle',
      icon: '🚗',
      color: 'teal',
      targetAmount: 450000,
      currentAmount: 210000,
      targetDate: '2027-08-15',
      createdDate: '2026-07-15',
      description: 'Downpayment and on-road registration fund'
    },
    {
      id: 'goal-vacation',
      name: 'Bali & Komodo Island Vacation',
      category: 'Travel',
      icon: '🏝️',
      color: 'pink',
      targetAmount: 120000,
      currentAmount: 84000,
      targetDate: '2027-01-20',
      createdDate: '2026-08-10',
      description: 'Resort stay, flights, and scuba certification'
    },
    {
      id: 'goal-laptop',
      name: 'Apple MacBook Pro M4 Max',
      category: 'Work & Tech',
      icon: '💻',
      color: 'orange',
      targetAmount: 180000,
      currentAmount: 65000,
      targetDate: '2027-06-30',
      createdDate: '2026-09-01',
      description: 'Hardware upgrade for development & machine learning'
    }
  ];

  // Default Goal Contributions
  const DEFAULT_GOAL_CONTRIBUTIONS = [
    { id: 'gc-1', goalId: 'goal-emergency', goalName: 'Emergency Fund (6 Months)', amount: 15000, date: 'Yesterday, 10:30 AM', account: 'HDFC Salary A/c' },
    { id: 'gc-2', goalId: 'goal-car', goalName: 'New Electric Car (Tata Curvv.ev)', amount: 20000, date: '28 Oct 2026', account: 'ICICI Savings A/c' },
    { id: 'gc-3', goalId: 'goal-vacation', goalName: 'Bali & Komodo Island Vacation', amount: 8000, date: '15 Oct 2026', account: 'HDFC Salary A/c' }
  ];

  // Default Seed Transactions
  const DEFAULT_TRANSACTIONS = [
    { id: 'TX-101', merchant: 'Amazon India', desc: 'Electronics & Gadgets', category: 'Shopping', method: 'HDFC Millennia Card', amount: 1240, type: 'expense', date: 'Today, 2:45 PM', status: 'Completed', icon: '🛒', iconClass: 'shopping-icon' },
    { id: 'TX-102', merchant: 'Netflix Premium 4K', desc: 'Monthly Subscription', category: 'Entertainment', method: 'Auto-Debit e-Mandate', amount: 649, type: 'expense', date: 'Today, 8:15 AM', status: 'Completed', icon: '🎬', iconClass: 'media-icon' },
    { id: 'TX-103', merchant: 'TechCorp Salary Credit', desc: 'Monthly Salary Credit', category: 'Income', method: 'NEFT Inward Direct', amount: 65000, type: 'income', date: '1 Sep, 10:00 AM', status: 'Completed', icon: '💼', iconClass: 'salary-icon' },
    { id: 'TX-104', merchant: 'Zomato Gourmet', desc: 'Dinner Delivery', category: 'Food', method: 'UPI Instant (GPay)', amount: 560, type: 'expense', date: 'Yesterday, 9:20 PM', status: 'Completed', icon: '🍔', iconClass: 'food-icon' },
    { id: 'TX-105', merchant: 'Uber Premier Ride', desc: 'Airport Commute', category: 'Commute', method: 'Paytm UPI Push', amount: 340, type: 'expense', date: '14 Sep, 6:30 PM', status: 'Completed', icon: '🚗', iconClass: 'travel-icon' },
    { id: 'TX-106', merchant: 'Freelance UI Design Milestone', desc: 'SaaS Client Wireframes', category: 'Income', method: 'Direct Bank Wire', amount: 18500, type: 'income', date: '12 Sep, 3:15 PM', status: 'Completed', icon: '💻', iconClass: 'freelance-icon' },
    { id: 'TX-107', merchant: 'Adani Electricity Mumbai', desc: 'Residential Power Utility', category: 'Utilities', method: 'BillDesk Auto-Debit', amount: 1890, type: 'expense', date: '28 Aug, 4:10 PM', status: 'Completed', icon: '⚡', iconClass: 'util-icon' },
    { id: 'TX-108', merchant: 'Swiggy Instamart', desc: 'Grocery Essentials', category: 'Food', method: 'ICICI iMobile UPI', amount: 420, type: 'expense', date: '27 Aug, 11:45 AM', status: 'Completed', icon: '🍎', iconClass: 'grocery-icon' },
    { id: 'TX-109', merchant: 'Zerodha Coin Nifty 50 SIP', desc: 'Automated Index Allocation', category: 'Investments', method: 'NACH Mandate', amount: 10000, type: 'expense', date: '25 Aug, 9:00 AM', status: 'Completed', icon: '📈', iconClass: 'invest-icon' },
    { id: 'TX-110', merchant: 'Starbucks Reserve', desc: 'Beverages & Pastries', category: 'Food', method: 'ICICI Coral Card', amount: 380, type: 'expense', date: '24 Aug, 5:15 PM', status: 'Completed', icon: '☕', iconClass: 'coffee-icon' }
  ];

  // Global FinSight Object
  const FinSight = {
    /**
     * Format a number into Indian Rupee currency format (₹ X,XX,XXX)
     */
    formatINR(value, includeDecimals = false) {
      const num = Number(value) || 0;
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: includeDecimals ? 2 : 0,
        maximumFractionDigits: includeDecimals ? 2 : 0
      }).format(num);
    },

    /**
     * Compact Indian Rupee format (e.g. ₹3.2L, ₹28.4k)
     */
    formatCompactINR(value) {
      const num = Math.abs(Number(value)) || 0;
      if (num >= 100000) {
        return `₹${(num / 100000).toFixed(1)}L`;
      }
      if (num >= 1000) {
        return `₹${(num / 1000).toFixed(1)}k`;
      }
      return `₹${num.toFixed(0)}`;
    },

    /**
     * Toast notification manager
     */
    toastTimeout: null,
    showToast(message, duration = 3500) {
      let toastEl = document.querySelector('.dashboard-toast');
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.className = 'dashboard-toast';
        toastEl.setAttribute('role', 'status');
        toastEl.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastEl);
      }

      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
      }

      toastEl.textContent = message;
      toastEl.classList.add('visible');

      this.toastTimeout = setTimeout(() => {
        toastEl.classList.remove('visible');
      }, duration);
    },

    /**
     * Modal dialog handling
     */
    openModal(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      const firstInput = modal.querySelector('input, select, textarea');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 80);
      }
    },

    closeModal(modalId) {
      const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
      if (!modal) return;
      modal.classList.remove('active');
      document.body.style.overflow = '';
      const form = modal.querySelector('form');
      if (form) form.reset();
    },

    initModals() {
      // Close on modal backdrop click
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
          e.preventDefault();
          const modal = e.target.closest('.modal-overlay');
          if (modal) FinSight.closeModal(modal);
        }
        if (e.target.closest('.modal-close') || e.target.closest('.modal-close-btn')) {
          e.preventDefault();
          const modal = e.target.closest('.modal-overlay');
          if (modal) FinSight.closeModal(modal);
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const activeModal = document.querySelector('.modal-overlay.active, .modal-overlay:target');
          if (activeModal) {
            FinSight.closeModal(activeModal);
            if (window.location.hash) {
              history.pushState('', document.title, window.location.pathname + window.location.search);
            }
          }
        }
      });

      // Intercept anchor modal targets (e.g. href="#txModal", href="#goalModal")
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (link) {
          const hash = link.getAttribute('href');
          if (hash && hash.length > 1) {
            const targetModal = document.querySelector(hash);
            if (targetModal && targetModal.classList.contains('modal-overlay')) {
              e.preventDefault();
              FinSight.openModal(hash.substring(1));
            }
          }
        }
      });
    },

    /**
     * LocalStorage Store Manager
     */
    store: {
      getTransactions() {
        try {
          const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
          if (data) return JSON.parse(data);
          localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
          return DEFAULT_TRANSACTIONS;
        } catch (e) {
          return DEFAULT_TRANSACTIONS;
        }
      },

      saveTransactions(txs) {
        try {
          localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
        } catch (e) {
          console.warn('FinSight Store: Error saving transactions', e);
        }
      },

      addTransaction(newTx) {
        const list = this.getTransactions();
        list.unshift(newTx);
        this.saveTransactions(list);
        return list;
      },

      getGoals() {
        try {
          const data = localStorage.getItem(STORAGE_KEYS.GOALS);
          if (data) return JSON.parse(data);
          localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
          return DEFAULT_GOALS;
        } catch (e) {
          return DEFAULT_GOALS;
        }
      },

      saveGoals(goals) {
        try {
          localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
          FinSight.updateNavBadges();
        } catch (e) {
          console.warn('FinSight Store: Error saving goals', e);
        }
      },

      addGoal(goal) {
        const goals = this.getGoals();
        if (!goal.id) goal.id = 'goal-' + Date.now();
        if (typeof goal.currentAmount !== 'number') goal.currentAmount = 0;
        goals.unshift(goal);
        this.saveGoals(goals);
        return goals;
      },

      updateGoal(id, updates) {
        const goals = this.getGoals();
        const idx = goals.findIndex(g => g.id === id);
        if (idx !== -1) {
          goals[idx] = { ...goals[idx], ...updates };
          this.saveGoals(goals);
        }
        return goals;
      },

      deleteGoal(id) {
        let goals = this.getGoals();
        goals = goals.filter(g => g.id !== id);
        this.saveGoals(goals);
        return goals;
      },

      getGoalContributions() {
        try {
          const data = localStorage.getItem(STORAGE_KEYS.GOAL_CONTRIBUTIONS);
          if (data) return JSON.parse(data);
          localStorage.setItem(STORAGE_KEYS.GOAL_CONTRIBUTIONS, JSON.stringify(DEFAULT_GOAL_CONTRIBUTIONS));
          return DEFAULT_GOAL_CONTRIBUTIONS;
        } catch (e) {
          return DEFAULT_GOAL_CONTRIBUTIONS;
        }
      },

      saveGoalContributions(list) {
        try {
          localStorage.setItem(STORAGE_KEYS.GOAL_CONTRIBUTIONS, JSON.stringify(list));
        } catch (e) {}
      },

      addFundsToGoal(goalId, amount, accountName = 'Liquid Funds') {
        const goals = this.getGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return null;

        goal.currentAmount = (goal.currentAmount || 0) + Number(amount);
        this.saveGoals(goals);

        // Record contribution
        const contribs = this.getGoalContributions();
        contribs.unshift({
          id: 'gc-' + Date.now(),
          goalId: goal.id,
          goalName: goal.name,
          amount: Number(amount),
          date: 'Just now',
          account: accountName
        });
        this.saveGoalContributions(contribs);

        return goal;
      }
    },

    updateNavBadges() {
      const goalsBadge = document.getElementById('goalsNavBadge');
      if (goalsBadge) {
        const activeGoals = this.store.getGoals();
        goalsBadge.textContent = activeGoals.length;
      }
    },

    /**
     * Initialize on DOM ready
     */
    init() {
      this.initModals();
      this.updateNavBadges();
    }
  };

  // Expose to window
  window.FinSight = FinSight;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FinSight.init());
  } else {
    FinSight.init();
  }

})(window, document);

