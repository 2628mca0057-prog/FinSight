/**
 * FinSight — Accounts & Portfolio Hub Engine
 * Manages bank accounts, demat holdings, credit limits,
 * live transfers, balance synchronizations, and portfolio allocation.
 */

(function () {
  'use strict';

  // Storage keys
  const STORAGE_KEYS = {
    ACCOUNTS: 'finsight_accounts_v1',
    TRANSFERS: 'finsight_transfers_v1'
  };

  // Default accounts dataset (seeded if no localStorage found)
  const DEFAULT_ACCOUNTS = [
    {
      id: 'hdfc-salary',
      institution: 'HDFC Bank',
      logoText: 'HDFC BANK',
      type: 'bank',
      subType: 'Corporate Salary Account',
      accountNumber: '•••• •••• •••• 8831',
      fullNumber: '5010 0482 9188 31',
      isMasked: true,
      balance: 284500,
      statusText: '● Live Sync',
      statusClass: 'live',
      cardClass: 'card-hdfc',
      footerLeft: 'Primary Operating A/c',
      footerRight: 'IFSC: HDFC0001241',
      rawCode: 'HDFC0001241',
      isCustom: false
    },
    {
      id: 'icici-privilege',
      institution: 'ICICI Bank',
      logoText: 'ICICI BANK',
      type: 'bank',
      subType: 'iMobile Privilege Savings',
      accountNumber: '•••• •••• •••• 4109',
      fullNumber: '0011 0156 4109 00',
      isMasked: true,
      balance: 145000,
      statusText: '● Live Sync',
      statusClass: 'live',
      cardClass: 'card-icici',
      footerLeft: 'Auto-Sweep Enabled (6.8%)',
      footerRight: 'IFSC: ICIC0000842',
      rawCode: 'ICIC0000842',
      isCustom: false
    },
    {
      id: 'zerodha-demat',
      institution: 'Zerodha',
      logoText: 'ZERODHA',
      type: 'demat',
      subType: 'Demat & Mutual Funds',
      accountNumber: 'UCC: NT9021 • CDSL',
      fullNumber: '1208160098273611',
      isMasked: true,
      balance: 412800,
      statusText: '● Synced',
      statusClass: 'live',
      cardClass: 'card-zerodha',
      badgeText: '+18.4% Return',
      badgeClass: 'demat-badge',
      footerLeft: '3 Active SIPs (₹10k/mo)',
      footerRight: 'Nifty 50, Flexi, Midcap',
      rawCode: 'NT9021',
      isCustom: false
    },
    {
      id: 'hdfc-regalia',
      institution: 'HDFC Regalia Gold',
      logoText: 'HDFC REGALIA GOLD',
      type: 'credit',
      subType: 'Visa Signature Credit Card',
      accountNumber: '•••• •••• •••• 6022',
      fullNumber: '4528 8901 2345 6022',
      isMasked: true,
      balance: 18410, // unbilled spend / dues
      creditLimit: 400000,
      statusText: 'Bill Due in 27d',
      statusClass: 'card-alert',
      cardClass: 'card-regalia',
      footerLeft: 'Available Limit: ₹3,81,590',
      footerRight: 'Points: 14,200 pts',
      rawCode: '6022',
      isCustom: false
    }
  ];

  // Default initial transfer activity history
  const DEFAULT_TRANSFERS = [
    {
      id: 'TXN-9082',
      fromName: 'HDFC Salary A/c',
      toName: 'Zerodha Trading Wallet',
      amount: 10000,
      date: 'Yesterday, 09:30 AM',
      status: 'Completed'
    },
    {
      id: 'TXN-8741',
      fromName: 'ICICI Savings A/c',
      toName: 'HDFC Regalia Credit Card',
      amount: 22500,
      date: '28 Sep, 02:15 PM',
      status: 'Completed'
    }
  ];

  let accountsState = [];
  let transfersState = [];
  const elements = {};

  const formatINR = (val, dec) => window.FinSight ? FinSight.formatINR(val, dec) : `₹${val.toLocaleString('en-IN')}`;
  const formatCompactINR = (val) => window.FinSight ? FinSight.formatCompactINR(val) : `₹${val}`;
  const showToast = (msg, dur) => window.FinSight ? FinSight.showToast(msg, dur) : alert(msg);

  function loadState() {
    try {
      const savedAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (savedAccounts) {
        accountsState = JSON.parse(savedAccounts);
      } else {
        accountsState = JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS));
        saveAccounts();
      }
    } catch (e) {
      accountsState = JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS));
    }

    try {
      const savedTransfers = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
      if (savedTransfers) {
        transfersState = JSON.parse(savedTransfers);
      } else {
        transfersState = JSON.parse(JSON.stringify(DEFAULT_TRANSFERS));
        saveTransfers();
      }
    } catch (e) {
      transfersState = JSON.parse(JSON.stringify(DEFAULT_TRANSFERS));
    }
  }

  function saveAccounts() {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accountsState));
    } catch (e) {}
  }

  function saveTransfers() {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfersState));
    } catch (e) {}
  }

  function cacheElements() {
    elements.accountsGrid = document.getElementById('accountsGrid');
    elements.transferForm = document.getElementById('transferForm');
    elements.transferFrom = document.getElementById('transferFrom');
    elements.transferTo = document.getElementById('transferTo');
    elements.transferAmount = document.getElementById('transferAmount');
    elements.fromAccountHint = document.getElementById('fromAccountHint');
    elements.toAccountHint = document.getElementById('toAccountHint');
    elements.transferHistoryList = document.getElementById('transferHistoryList');
    elements.clearTransfersBtn = document.getElementById('clearTransfersBtn');
    elements.transferSubmitBtn = document.getElementById('transferSubmitBtn');

    elements.transferBtn = document.getElementById('transferBtn');
    elements.linkAccountBtn = document.getElementById('linkAccountBtn');
    elements.transferCardBox = document.getElementById('transferCardBox');

    elements.kpiLiquidCash = document.getElementById('kpiLiquidCash');
    elements.kpiLiquidSubtitle = document.getElementById('kpiLiquidSubtitle');
    elements.kpiLiquidSubtext = document.getElementById('kpiLiquidSubtext');

    elements.kpiInvestments = document.getElementById('kpiInvestments');
    elements.kpiInvestmentsSubtitle = document.getElementById('kpiInvestmentsSubtitle');
    elements.kpiInvestmentsSubtext = document.getElementById('kpiInvestmentsSubtext');

    elements.kpiCreditDues = document.getElementById('kpiCreditDues');
    elements.kpiCreditSubtitle = document.getElementById('kpiCreditSubtitle');
    elements.kpiCreditSubtext = document.getElementById('kpiCreditSubtext');

    elements.kpiNetWorth = document.getElementById('kpiNetWorth');
    elements.kpiNetWorthSubtitle = document.getElementById('kpiNetWorthSubtitle');
    elements.kpiNetWorthSubtext = document.getElementById('kpiNetWorthSubtext');

    elements.allocEquityNumbers = document.getElementById('allocEquityNumbers');
    elements.allocEquityBar = document.getElementById('allocEquityBar');
    elements.allocLiquidNumbers = document.getElementById('allocLiquidNumbers');
    elements.allocLiquidBar = document.getElementById('allocLiquidBar');
    elements.allocCreditNumbers = document.getElementById('allocCreditNumbers');
    elements.allocCreditBar = document.getElementById('allocCreditBar');
    elements.allocationTag = document.getElementById('allocationTag');

    elements.accountsNavBadge = document.getElementById('accountsNavBadge');

    elements.linkAccountModal = document.getElementById('linkAccountModal');
    elements.linkAccountForm = document.getElementById('linkAccountForm');
    elements.closeLinkModalBtn = document.getElementById('closeLinkModalBtn');
    elements.cancelLinkModalBtn = document.getElementById('cancelLinkModalBtn');
    elements.linkModalBackdrop = document.getElementById('linkModalBackdrop');
    elements.accType = document.getElementById('accType');
    elements.accBank = document.getElementById('accBank');
    elements.accSubtype = document.getElementById('accSubtype');
    elements.accNumber = document.getElementById('accNumber');
    elements.accBalance = document.getElementById('accBalance');
    elements.accBalanceLabel = document.getElementById('accBalanceLabel');
    elements.accIdentifier = document.getElementById('accIdentifier');
    elements.accIdentifierLabel = document.getElementById('accIdentifierLabel');
  }

  function renderAccountCards() {
    if (!elements.accountsGrid) return;
    elements.accountsGrid.innerHTML = '';

    accountsState.forEach((acc) => {
      const card = document.createElement('div');
      card.className = `bank-card ${acc.cardClass || 'card-generic'}`;
      card.setAttribute('data-id', acc.id);

      const topRow = document.createElement('div');
      topRow.className = 'bank-card-top';

      const brandDiv = document.createElement('div');
      brandDiv.className = 'bank-brand';
      brandDiv.innerHTML = `
        <span class="bank-logo-text">${acc.logoText || acc.institution.toUpperCase()}</span>
        <span class="bank-acc-type">${acc.subType}</span>
      `;

      const syncSpan = document.createElement('span');
      syncSpan.className = `sync-status-indicator ${acc.statusClass || 'live'}`;
      syncSpan.title = 'Click to sync balance via Open Banking';
      syncSpan.textContent = acc.statusText || '● Live Sync';
      syncSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerAccountSync(acc.id, syncSpan);
      });

      topRow.appendChild(brandDiv);
      topRow.appendChild(syncSpan);

      const numDiv = document.createElement('div');
      numDiv.className = 'bank-card-number';
      numDiv.title = 'Click to toggle masked / full number';
      numDiv.textContent = acc.isMasked ? acc.accountNumber : acc.fullNumber;
      numDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        acc.isMasked = !acc.isMasked;
        numDiv.textContent = acc.isMasked ? acc.accountNumber : acc.fullNumber;
        saveAccounts();
        showToast(acc.isMasked ? 'Card number hidden' : 'Card number revealed 👁️', 1800);
      });

      const bottomRow = document.createElement('div');
      bottomRow.className = 'bank-card-bottom';

      const balanceBlock = document.createElement('div');
      let balanceLabel = 'Available Balance';
      if (acc.type === 'demat') balanceLabel = 'Portfolio Valuation';
      if (acc.type === 'credit') balanceLabel = 'Current Unbilled Spend';

      balanceBlock.innerHTML = `
        <span class="bank-label">${balanceLabel}</span>
        <p class="bank-balance">${formatINR(acc.balance, true)}</p>
      `;

      bottomRow.appendChild(balanceBlock);

      if (acc.type === 'demat') {
        const badge = document.createElement('div');
        badge.className = acc.badgeClass || 'demat-badge';
        badge.textContent = acc.badgeText || '+18.4% Return';
        bottomRow.appendChild(badge);
      } else if (acc.type === 'credit') {
        const limitSpan = document.createElement('span');
        limitSpan.className = 'card-limit-info';
        limitSpan.textContent = `Limit: ${formatINR(acc.creditLimit || 400000)}`;
        bottomRow.appendChild(limitSpan);
      } else {
        const chip = document.createElement('div');
        chip.className = 'bank-chip';
        bottomRow.appendChild(chip);
      }

      const footerRow = document.createElement('div');
      footerRow.className = 'bank-card-footer';

      const footLeft = document.createElement('span');
      if (acc.type === 'credit' && acc.creditLimit) {
        const avail = Math.max(0, acc.creditLimit - acc.balance);
        footLeft.textContent = `Available Limit: ${formatINR(avail)}`;
      } else {
        footLeft.textContent = acc.footerLeft || 'Active Account';
      }

      const footRight = document.createElement('span');
      footRight.className = 'copyable-code';
      footRight.title = 'Click to copy';
      footRight.textContent = acc.footerRight || 'Synced';
      footRight.addEventListener('click', (e) => {
        e.stopPropagation();
        const textToCopy = acc.rawCode || acc.footerRight;
        copyToClipboard(textToCopy, `Copied ${textToCopy} to clipboard! 📋`);
      });

      footerRow.appendChild(footLeft);
      footerRow.appendChild(footRight);

      card.appendChild(topRow);
      card.appendChild(numDiv);
      card.appendChild(bottomRow);
      card.appendChild(footerRow);

      if (acc.isCustom) {
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'bank-card-delete';
        delBtn.title = 'Unlink Account';
        delBtn.innerHTML = '&times;';
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteAccount(acc.id);
        });
        card.appendChild(delBtn);
      }

      elements.accountsGrid.appendChild(card);
    });

    if (elements.accountsNavBadge) {
      elements.accountsNavBadge.textContent = accountsState.length;
    }
  }

  function copyToClipboard(text, successMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast(successMessage)).catch(() => fallbackCopy(text, successMessage));
    } else {
      fallbackCopy(text, successMessage);
    }
  }

  function fallbackCopy(text, successMessage) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      showToast(successMessage);
    } catch (e) {
      showToast(`Code: ${text}`);
    }
    document.body.removeChild(input);
  }

  function triggerAccountSync(accId, syncBadgeElement) {
    const acc = accountsState.find(a => a.id === accId);
    if (!acc) return;

    const originalText = syncBadgeElement.textContent;
    syncBadgeElement.textContent = '⏳ Syncing...';
    syncBadgeElement.style.opacity = '0.8';

    const card = document.querySelector(`[data-id="${accId}"]`);
    if (card) card.classList.add('card-pulse');

    setTimeout(() => {
      syncBadgeElement.textContent = '● Synced Now';
      syncBadgeElement.style.opacity = '1';
      if (card) card.classList.remove('card-pulse');
      showToast(`⚡ ${acc.institution} balances synchronized successfully via Open Banking!`);
      setTimeout(() => {
        syncBadgeElement.textContent = originalText;
      }, 4000);
    }, 750);
  }

  function updateKPIs() {
    let liquidCash = 0;
    let bankCount = 0;
    let investments = 0;
    let creditDues = 0;
    let creditLimit = 0;
    let bankNames = [];

    accountsState.forEach((acc) => {
      if (acc.type === 'bank') {
        liquidCash += acc.balance;
        bankCount++;
        bankNames.push(acc.institution.split(' ')[0]);
      } else if (acc.type === 'demat') {
        investments += acc.balance;
      } else if (acc.type === 'credit') {
        creditDues += acc.balance;
        creditLimit += (acc.creditLimit || 400000);
      }
    });

    const netWorth = liquidCash + investments - creditDues;
    const totalAssets = liquidCash + investments;

    if (elements.kpiLiquidCash) elements.kpiLiquidCash.textContent = formatINR(liquidCash);
    if (elements.kpiLiquidSubtitle) elements.kpiLiquidSubtitle.textContent = `Across ${bankCount} bank account${bankCount === 1 ? '' : 's'}`;
    if (elements.kpiLiquidSubtext) elements.kpiLiquidSubtext.textContent = bankNames.join(' + ') || 'Liquid Balances';

    if (elements.kpiInvestments) elements.kpiInvestments.textContent = formatINR(investments);
    if (elements.kpiCreditDues) elements.kpiCreditDues.textContent = formatINR(creditDues);
    if (elements.kpiCreditSubtext) elements.kpiCreditSubtext.textContent = `Credit Lines (Limit: ${formatCompactINR(creditLimit)})`;

    if (elements.kpiNetWorth) elements.kpiNetWorth.textContent = formatINR(netWorth);
    if (elements.kpiNetWorthSubtext) elements.kpiNetWorthSubtext.textContent = `Assets: ${formatCompactINR(totalAssets)} • Debt: ${formatCompactINR(creditDues)}`;
  }

  function updateAssetAllocation() {
    let liquidCash = 0;
    let investments = 0;
    let creditDues = 0;
    let creditLimit = 0;

    accountsState.forEach((acc) => {
      if (acc.type === 'bank') liquidCash += acc.balance;
      else if (acc.type === 'demat') investments += acc.balance;
      else if (acc.type === 'credit') {
        creditDues += acc.balance;
        creditLimit += (acc.creditLimit || 400000);
      }
    });

    const totalAssets = liquidCash + investments;
    const equityPct = totalAssets > 0 ? Math.round((investments / totalAssets) * 100) : 0;
    const liquidPct = totalAssets > 0 ? (100 - equityPct) : 0;
    const creditUtilPct = creditLimit > 0 ? ((creditDues / creditLimit) * 100).toFixed(1) : 0;

    if (elements.allocEquityNumbers) elements.allocEquityNumbers.textContent = `${formatINR(investments)} (${equityPct}%)`;
    if (elements.allocEquityBar) elements.allocEquityBar.style.width = `${equityPct}%`;

    if (elements.allocLiquidNumbers) elements.allocLiquidNumbers.textContent = `${formatINR(liquidCash)} (${liquidPct}%)`;
    if (elements.allocLiquidBar) elements.allocLiquidBar.style.width = `${liquidPct}%`;

    if (elements.allocCreditNumbers) elements.allocCreditNumbers.textContent = `${creditUtilPct}% of ${formatCompactINR(creditLimit)} limit`;
    if (elements.allocCreditBar) elements.allocCreditBar.style.width = `${Math.min(100, Math.max(2, creditUtilPct))}%`;

    if (elements.allocationTag) {
      if (equityPct >= 40 && equityPct <= 65) {
        elements.allocationTag.textContent = 'Optimal Balance';
        elements.allocationTag.style.background = 'rgba(16, 185, 129, 0.15)';
        elements.allocationTag.style.color = '#059669';
      } else if (equityPct > 65) {
        elements.allocationTag.textContent = 'Equity Heavy';
        elements.allocationTag.style.background = 'rgba(13, 148, 136, 0.15)';
        elements.allocationTag.style.color = '#0d9488';
      } else {
        elements.allocationTag.textContent = 'Liquid Reserve Heavy';
        elements.allocationTag.style.background = 'rgba(124, 58, 237, 0.15)';
        elements.allocationTag.style.color = '#7c3aed';
      }
    }
  }

  function updateTransferDropdowns() {
    if (!elements.transferFrom || !elements.transferTo) return;

    const currentFrom = elements.transferFrom.value;
    const currentTo = elements.transferTo.value;

    elements.transferFrom.innerHTML = '';
    elements.transferTo.innerHTML = '';

    const sourceCandidates = accountsState.filter(a => a.type === 'bank' || (a.type === 'demat' && a.balance > 0));

    sourceCandidates.forEach(acc => {
      const opt = document.createElement('option');
      opt.value = acc.id;
      opt.textContent = `${acc.institution} (${formatINR(acc.balance)})`;
      elements.transferFrom.appendChild(opt);
    });

    if (sourceCandidates.some(a => a.id === currentFrom)) {
      elements.transferFrom.value = currentFrom;
    } else if (sourceCandidates.length > 0) {
      elements.transferFrom.value = sourceCandidates[0].id;
    }

    refreshToDropdown(elements.transferFrom.value, currentTo);
    updateFromHint();
  }

  function refreshToDropdown(selectedFromId, preferredToId) {
    if (!elements.transferTo) return;
    elements.transferTo.innerHTML = '';

    const destinationCandidates = accountsState.filter(a => a.id !== selectedFromId);

    destinationCandidates.forEach(acc => {
      const opt = document.createElement('option');
      opt.value = acc.id;
      let label = `${acc.institution} (${formatINR(acc.balance)})`;
      if (acc.type === 'credit') {
        label = `${acc.institution} (Pay Dues: ${formatINR(acc.balance)})`;
      }
      opt.textContent = label;
      elements.transferTo.appendChild(opt);
    });

    if (destinationCandidates.some(a => a.id === preferredToId)) {
      elements.transferTo.value = preferredToId;
    } else if (destinationCandidates.length > 0) {
      elements.transferTo.value = destinationCandidates[0].id;
    }

    updateToHint();
  }

  function updateFromHint() {
    if (!elements.fromAccountHint || !elements.transferFrom) return;
    const fromId = elements.transferFrom.value;
    const acc = accountsState.find(a => a.id === fromId);
    if (acc) {
      elements.fromAccountHint.textContent = `Available: ${formatINR(acc.balance, true)}`;
      if (elements.transferAmount) elements.transferAmount.max = acc.balance;
    }
  }

  function updateToHint() {
    if (!elements.toAccountHint || !elements.transferTo) return;
    const toId = elements.transferTo.value;
    const acc = accountsState.find(a => a.id === toId);
    if (acc) {
      if (acc.type === 'credit') {
        elements.toAccountHint.textContent = `Settles card bill (Outstanding: ${formatINR(acc.balance)})`;
      } else if (acc.type === 'demat') {
        elements.toAccountHint.textContent = `Funds instant trading wallet liquidity`;
      } else {
        elements.toAccountHint.textContent = `Direct NEFT/IMPS transfer (Instant)`;
      }
    }
  }

  function renderTransferHistory() {
    if (!elements.transferHistoryList) return;
    elements.transferHistoryList.innerHTML = '';

    if (transfersState.length === 0) {
      elements.transferHistoryList.innerHTML = '<div class="empty-transfers-hint">No recent transfers recorded this session.</div>';
      return;
    }

    transfersState.slice(0, 5).forEach((t) => {
      const item = document.createElement('div');
      item.className = 'transfer-history-item';
      item.innerHTML = `
        <div class="transfer-item-left">
          <div class="transfer-item-icon">🔁</div>
          <div>
            <div class="transfer-item-route">${t.fromName} ➔ ${t.toName}</div>
            <div class="transfer-item-meta">${t.date} • ${t.id}</div>
          </div>
        </div>
        <div class="transfer-item-right">
          <div class="transfer-item-amount">${formatINR(t.amount)}</div>
          <span class="transfer-item-status">${t.status}</span>
        </div>
      `;
      elements.transferHistoryList.appendChild(item);
    });
  }

  function handleTransferSubmit(e) {
    e.preventDefault();

    const fromId = elements.transferFrom.value;
    const toId = elements.transferTo.value;
    const amount = Number(elements.transferAmount.value);

    if (fromId === toId) {
      showToast('⚠️ Source and destination accounts cannot be the same.');
      return;
    }

    if (!amount || amount < 500) {
      showToast('⚠️ Minimum transfer amount is ₹500.');
      return;
    }

    const fromAcc = accountsState.find(a => a.id === fromId);
    const toAcc = accountsState.find(a => a.id === toId);

    if (!fromAcc || !toAcc) {
      showToast('⚠️ Please select valid accounts for transfer.');
      return;
    }

    if (fromAcc.balance < amount) {
      showToast(`⚠️ Insufficient funds in ${fromAcc.institution}. Available: ${formatINR(fromAcc.balance)}`);
      return;
    }

    if (elements.transferSubmitBtn) {
      elements.transferSubmitBtn.disabled = true;
      elements.transferSubmitBtn.innerHTML = '<span>⏳ Executing Transfer...</span>';
    }

    setTimeout(() => {
      fromAcc.balance -= amount;

      if (toAcc.type === 'credit') {
        toAcc.balance = Math.max(0, toAcc.balance - amount);
      } else {
        toAcc.balance += amount;
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const refId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;

      transfersState.unshift({
        id: refId,
        fromName: fromAcc.institution,
        toName: toAcc.institution,
        amount: amount,
        date: `Today, ${timeStr}`,
        status: 'Completed'
      });

      saveAccounts();
      saveTransfers();

      renderAccountCards();
      updateKPIs();
      updateAssetAllocation();
      updateTransferDropdowns();
      renderTransferHistory();

      const fromCard = document.querySelector(`[data-id="${fromId}"]`);
      const toCard = document.querySelector(`[data-id="${toId}"]`);
      if (fromCard) fromCard.classList.add('card-pulse');
      if (toCard) toCard.classList.add('card-pulse');
      setTimeout(() => {
        if (fromCard) fromCard.classList.remove('card-pulse');
        if (toCard) toCard.classList.remove('card-pulse');
      }, 1200);

      elements.transferAmount.value = '';
      if (elements.transferSubmitBtn) {
        elements.transferSubmitBtn.disabled = false;
        elements.transferSubmitBtn.innerHTML = '<span>🔁 Execute Transfer</span>';
      }

      showToast(`✅ Successfully transferred ${formatINR(amount)} from ${fromAcc.institution} to ${toAcc.institution}! Ref: ${refId}`, 4500);
    }, 600);
  }

  function handlePresetClick(e) {
    const chip = e.target.closest('.preset-chip');
    if (!chip || !elements.transferAmount) return;

    const fromId = elements.transferFrom.value;
    const fromAcc = accountsState.find(a => a.id === fromId);
    const maxVal = fromAcc ? fromAcc.balance : 50000;

    const preset = chip.getAttribute('data-preset');
    if (preset === 'max') {
      elements.transferAmount.value = maxVal;
    } else {
      const addAmt = Number(chip.getAttribute('data-amount')) || 0;
      const currentVal = Number(elements.transferAmount.value) || 0;
      elements.transferAmount.value = Math.min(maxVal, currentVal + addAmt);
    }

    elements.transferAmount.dispatchEvent(new Event('input'));
  }

  function openLinkModal() {
    if (window.FinSight) FinSight.openModal('linkAccountModal');
    else if (elements.linkAccountModal) elements.linkAccountModal.classList.add('active');
  }

  function closeLinkModal() {
    if (window.FinSight) FinSight.closeModal('linkAccountModal');
    else if (elements.linkAccountModal) elements.linkAccountModal.classList.remove('active');
  }

  function handleAccTypeChange() {
    const type = elements.accType.value;
    if (type === 'credit') {
      elements.accBalanceLabel.textContent = 'Unbilled Dues (₹)';
      elements.accIdentifierLabel.textContent = 'Card Issuer Network / IFSC';
      if (elements.accIdentifier) elements.accIdentifier.placeholder = 'e.g. Visa Signature / RuPay';
    } else if (type === 'demat') {
      elements.accBalanceLabel.textContent = 'Portfolio Valuation (₹)';
      elements.accIdentifierLabel.textContent = 'Demat UCC / Depository';
      if (elements.accIdentifier) elements.accIdentifier.placeholder = 'e.g. CDSL NT9021';
    } else {
      elements.accBalanceLabel.textContent = 'Current Balance (₹)';
      elements.accIdentifierLabel.textContent = 'IFSC Code';
      if (elements.accIdentifier) elements.accIdentifier.placeholder = 'e.g. HDFC0001241';
    }
  }

  function handleLinkAccountSubmit(e) {
    e.preventDefault();

    const type = elements.accType.value;
    const bank = elements.accBank.value;
    const subtype = elements.accSubtype.value.trim();
    const rawNumber = elements.accNumber.value.trim();
    const balance = Number(elements.accBalance.value) || 0;
    const identifier = elements.accIdentifier.value.trim() || 'Active';

    const last4 = rawNumber.slice(-4) || '1234';
    const maskedNumber = `•••• •••• •••• ${last4}`;

    let cardClass = 'card-generic';
    const bLower = bank.toLowerCase();
    if (bLower.includes('hdfc')) cardClass = 'card-hdfc';
    else if (bLower.includes('icici')) cardClass = 'card-icici';
    else if (bLower.includes('sbi')) cardClass = 'card-sbi';
    else if (bLower.includes('axis')) cardClass = 'card-axis';
    else if (bLower.includes('kotak')) cardClass = 'card-kotak';
    else if (bLower.includes('zerodha')) cardClass = 'card-zerodha';
    else if (bLower.includes('groww')) cardClass = 'card-groww';

    const newAccId = `acc-${Date.now()}`;
    const newAccount = {
      id: newAccId,
      institution: bank === 'Other' ? subtype : `${bank} Bank`,
      logoText: bank.toUpperCase(),
      type: type,
      subType: subtype,
      accountNumber: type === 'demat' ? `UCC: ${last4} • CDSL` : maskedNumber,
      fullNumber: rawNumber,
      isMasked: true,
      balance: balance,
      creditLimit: type === 'credit' ? balance * 5 || 200000 : undefined,
      statusText: '● Live Sync',
      statusClass: 'live',
      cardClass: cardClass,
      footerLeft: type === 'credit' ? 'Linked Card' : 'Primary Account',
      footerRight: identifier.includes('IFSC') ? identifier : `${type === 'bank' ? 'IFSC: ' : ''}${identifier}`,
      rawCode: identifier,
      isCustom: true
    };

    accountsState.push(newAccount);
    saveAccounts();

    renderAccountCards();
    updateKPIs();
    updateAssetAllocation();
    updateTransferDropdowns();

    closeLinkModal();
    showToast(`🎉 Successfully linked ${newAccount.institution}! 256-bit bank sync active.`);

    setTimeout(() => {
      const newCard = document.querySelector(`[data-id="${newAccId}"]`);
      if (newCard) {
        newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        newCard.classList.add('card-pulse');
        setTimeout(() => newCard.classList.remove('card-pulse'), 1500);
      }
    }, 200);
  }

  function deleteAccount(accId) {
    const acc = accountsState.find(a => a.id === accId);
    if (!acc) return;

    if (confirm(`Are you sure you want to unlink and remove ${acc.institution} (${acc.subType})?`)) {
      accountsState = accountsState.filter(a => a.id !== accId);
      saveAccounts();

      renderAccountCards();
      updateKPIs();
      updateAssetAllocation();
      updateTransferDropdowns();

      showToast(`Removed ${acc.institution} from linked accounts.`);
    }
  }

  function handleClearTransfers() {
    if (transfersState.length === 0) return;
    if (confirm('Clear the recent transfer history log?')) {
      transfersState = [];
      saveTransfers();
      renderTransferHistory();
      showToast('Transfer activity log cleared.');
    }
  }

  function bindEvents() {
    if (elements.transferBtn) {
      elements.transferBtn.addEventListener('click', () => {
        if (elements.transferCardBox) {
          elements.transferCardBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (elements.transferAmount) elements.transferAmount.focus();
          elements.transferCardBox.classList.add('card-pulse');
          setTimeout(() => elements.transferCardBox.classList.remove('card-pulse'), 1000);
        }
      });
    }

    if (elements.linkAccountBtn) elements.linkAccountBtn.addEventListener('click', openLinkModal);
    if (elements.closeLinkModalBtn) elements.closeLinkModalBtn.addEventListener('click', closeLinkModal);
    if (elements.cancelLinkModalBtn) elements.cancelLinkModalBtn.addEventListener('click', closeLinkModal);
    if (elements.linkModalBackdrop) elements.linkModalBackdrop.addEventListener('click', closeLinkModal);
    if (elements.accType) elements.accType.addEventListener('change', handleAccTypeChange);
    if (elements.linkAccountForm) elements.linkAccountForm.addEventListener('submit', handleLinkAccountSubmit);

    if (elements.transferFrom) {
      elements.transferFrom.addEventListener('change', () => {
        refreshToDropdown(elements.transferFrom.value, elements.transferTo ? elements.transferTo.value : '');
        updateFromHint();
      });
    }

    if (elements.transferTo) elements.transferTo.addEventListener('change', updateToHint);
    if (elements.transferForm) elements.transferForm.addEventListener('submit', handleTransferSubmit);

    const presetsWrap = document.querySelector('.quick-presets');
    if (presetsWrap) presetsWrap.addEventListener('click', handlePresetClick);
    if (elements.clearTransfersBtn) elements.clearTransfersBtn.addEventListener('click', handleClearTransfers);
  }

  function init() {
    loadState();
    cacheElements();
    renderAccountCards();
    updateKPIs();
    updateAssetAllocation();
    updateTransferDropdowns();
    renderTransferHistory();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

