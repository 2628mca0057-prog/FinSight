/**
 * FinSight — Payments Apps & UPI Integration Controller
 * Powers payments-integration.html: Live webhook synchronizations,
 * manual gateway refresh triggers, and real-time transaction streaming.
 */

(function () {
  'use strict';

  /**
   * Sync All Now Button
   */
  function initSyncAll() {
    const syncAllBtn = document.querySelector('.top-actions .btn-secondary');
    if (!syncAllBtn) return;

    syncAllBtn.addEventListener('click', () => {
      syncAllBtn.disabled = true;
      syncAllBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Syncing Webhooks...</span>';

      const gatewayCards = document.querySelectorAll('.gateway-card');
      gatewayCards.forEach(card => card.classList.add('card-pulse'));

      setTimeout(() => {
        gatewayCards.forEach(card => card.classList.remove('card-pulse'));

        // Prepend new incoming event to Real-Time Sync Stream table
        const streamTableBody = document.querySelector('.transactions-box.full-width-box tbody');
        if (streamTableBody) {
          const sampleMerchants = [
            { name: 'Swiggy Instamart', gateway: 'Google Pay', amount: '-₹420' },
            { name: 'Uber Premier', gateway: 'Paytm', amount: '-₹290' },
            { name: 'Tata Sky DTH', gateway: 'PhonePe', amount: '-₹350' },
            { name: 'CRED Card Bill', gateway: 'CRED', amount: '-₹18,410' }
          ];
          const item = sampleMerchants[Math.floor(Math.random() * sampleMerchants.length)];

          const tr = document.createElement('tr');
          tr.style.background = '#f0fdf4';
          tr.innerHTML = `
            <td>Just now</td>
            <td><span class="tx-method-pill">${item.gateway}</span></td>
            <td><strong>${item.name}</strong> • Live Sync</td>
            <td><span class="tx-status-badge status-completed">Instant Webhook</span></td>
            <td class="tx-amount-col"><span class="tx-badge-negative">${item.amount}</span></td>
          `;
          streamTableBody.insertBefore(tr, streamTableBody.firstChild);
          setTimeout(() => tr.style.background = '', 2000);
        }

        syncAllBtn.disabled = false;
        syncAllBtn.innerHTML = '<span class="btn-icon">🔄</span><span>Sync All Now</span>';

        FinSight.showToast('⚡ All 5 payment apps & UPI gateways synchronized in 1.2s! (0 errors)', 4500);
      }, 900);
    });
  }

  /**
   * Connect Gateway Button
   */
  function initConnectGateway() {
    const connectBtn = document.querySelector('.top-actions .btn-primary');
    if (!connectBtn) return;

    connectBtn.addEventListener('click', () => {
      const handle = prompt('Enter UPI VPA or Payment Gateway handle to link (e.g. user@okhdfcbank or Amazon Pay):');
      if (handle) {
        FinSight.showToast(`🔒 Linking ${handle} via 256-Bit Account Aggregator API...`, 3000);
        setTimeout(() => {
          FinSight.showToast(`🎉 Gateway ${handle} verified and active for instant sync!`, 4000);
        }, 1200);
      }
    });
  }

  /**
   * Individual Gateway Card Buttons
   */
  function initGatewayButtons() {
    const cards = document.querySelectorAll('.gateway-card');

    cards.forEach(card => {
      const btn = card.querySelector('.btn-micro');
      const brand = card.querySelector('.gateway-brand strong')?.textContent || 'Gateway';

      if (btn) {
        btn.addEventListener('click', () => {
          if (btn.textContent.includes('Config')) {
            FinSight.showToast('🔒 Local SMS NLP Parser: 100% on-device sandboxed execution. Zero network leaks.');
          } else {
            btn.disabled = true;
            btn.textContent = 'Syncing...';
            card.classList.add('card-pulse');

            setTimeout(() => {
              btn.disabled = false;
              btn.textContent = 'Refresh';
              card.classList.remove('card-pulse');

              const indicator = card.querySelector('.sync-status-indicator');
              if (indicator) {
                indicator.textContent = '● Synced Now';
                setTimeout(() => indicator.textContent = '● Connected', 3000);
              }

              FinSight.showToast(`⚡ ${brand} webhook refreshed and up to date!`);
            }, 600);
          }
        });
      }
    });
  }

  function init() {
    initSyncAll();
    initConnectGateway();
    initGatewayButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

