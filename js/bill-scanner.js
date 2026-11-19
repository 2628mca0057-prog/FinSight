/**
 * FinSight — Smart OCR Bill Scanner Controller
 * Powers bill-scanner.html: Receipt drag & drop parsing, sample invoice switching,
 * simulated neural OCR extraction, and direct expense logging.
 */

(function () {
  'use strict';

  // Sample bill datasets
  const SAMPLE_BILLS = {
    starbucks: {
      merchant: 'Starbucks Coffee India',
      date: '14 Sep 2026, 05:15 PM',
      invoice: 'SBX-MUM-2026-99214',
      category: 'Food & Dining',
      confidence: '99.8% Match',
      items: [
        { name: '1x Caffe Latte (Grande)', price: '₹310.00' },
        { name: '1x Blueberry Muffin', price: '₹190.00' },
        { name: 'CGST / SGST (5%)', price: '₹25.00', muted: true }
      ],
      total: '₹525.00',
      numericTotal: 525
    },
    electricity: {
      merchant: 'Adani Electricity Mumbai Ltd',
      date: '28 Aug 2026, 04:10 PM',
      invoice: 'ADANI-POW-88421',
      category: 'Utilities',
      confidence: '99.9% Match',
      items: [
        { name: 'Residential Units (284 kWh)', price: '₹1,650.00' },
        { name: 'Fixed Standing Meter Charge', price: '₹140.00' },
        { name: 'State Electricity Duty (Govt)', price: '₹100.00', muted: true }
      ],
      total: '₹1,890.00',
      numericTotal: 1890
    },
    amazon: {
      merchant: 'Amazon Seller Services India',
      date: 'Today, 02:45 PM',
      invoice: 'INV-AMZ-2026-4019',
      category: 'Shopping',
      confidence: '99.5% Match',
      items: [
        { name: 'Logitech MX Master 3S Mouse', price: '₹2,299.00' },
        { name: 'Prime Express Courier Shipping', price: '₹0.00', muted: true },
        { name: 'IGST (18%) Integrated Tax', price: '₹200.00', muted: true }
      ],
      total: '₹2,499.00',
      numericTotal: 2499
    }
  };

  let activeBill = SAMPLE_BILLS.starbucks;

  /**
   * Render Bill Metadata into OCR Preview Card
   */
  function renderBillData(bill) {
    activeBill = bill;

    const merchantEl = document.getElementById('ocrMerchant');
    const dateEl = document.getElementById('ocrDate');
    const invoiceEl = document.getElementById('ocrInvoice');
    const categoryEl = document.getElementById('ocrCategory');
    const totalEl = document.getElementById('ocrTotal');
    const confidenceTag = document.querySelector('.ocr-confidence-tag');
    const itemsTable = document.querySelector('.parsed-items-table');

    if (merchantEl) merchantEl.textContent = bill.merchant;
    if (dateEl) dateEl.textContent = bill.date;
    if (invoiceEl) invoiceEl.textContent = bill.invoice;
    if (categoryEl) categoryEl.textContent = bill.category;
    if (totalEl) totalEl.textContent = bill.total;
    if (confidenceTag) confidenceTag.textContent = bill.confidence;

    if (itemsTable) {
      let rowsHtml = '';
      bill.items.forEach(it => {
        rowsHtml += `
          <div class="item-row ${it.muted ? 'text-muted' : ''}">
            <span>${it.name}</span>
            <span>${it.price}</span>
          </div>
        `;
      });
      rowsHtml += `
        <div class="item-row total-row">
          <strong>Total Amount Detected:</strong>
          <strong class="highlight-val" id="ocrTotal">${bill.total}</strong>
        </div>
      `;
      itemsTable.innerHTML = rowsHtml;
    }
  }

  /**
   * Sample buttons click handlers
   */
  function initSampleButtons() {
    const starbucksBtn = document.getElementById('sampleStarbucksBtn');
    const electricityBtn = document.getElementById('sampleElectricityBtn');
    const amazonBtn = document.getElementById('sampleAmazonBtn');
    const buttons = [starbucksBtn, electricityBtn, amazonBtn].filter(Boolean);

    function setActive(btn, billKey) {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const previewBox = document.querySelector('.ocr-preview-box');
      if (previewBox) {
        previewBox.style.opacity = '0.4';
        setTimeout(() => {
          renderBillData(SAMPLE_BILLS[billKey]);
          previewBox.style.opacity = '1';
        }, 150);
      } else {
        renderBillData(SAMPLE_BILLS[billKey]);
      }

      FinSight.showToast(`🧾 Loaded ${SAMPLE_BILLS[billKey].merchant} sample bill.`);
    }

    if (starbucksBtn) starbucksBtn.addEventListener('click', () => setActive(starbucksBtn, 'starbucks'));
    if (electricityBtn) electricityBtn.addEventListener('click', () => setActive(electricityBtn, 'electricity'));
    if (amazonBtn) amazonBtn.addEventListener('click', () => setActive(amazonBtn, 'amazon'));
  }

  /**
   * File dropzone handling
   */
  function initDropzone() {
    const dropzone = document.getElementById('dropzoneBox');
    const fileInput = document.getElementById('receiptFileInput');
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
        dropzone.style.borderColor = '#7c3aed';
        dropzone.style.background = '#f5f3ff';
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
        dropzone.style.borderColor = '';
        dropzone.style.background = '';
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processUploadedFile(files[0]);
      }
    });

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          processUploadedFile(e.target.files[0]);
        }
      });
    }
  }

  function processUploadedFile(file) {
    FinSight.showToast(`🧠 Neural OCR running on "${file.name}"...`, 2000);

    const previewBox = document.querySelector('.ocr-preview-box');
    if (previewBox) {
      previewBox.style.opacity = '0.3';
    }

    setTimeout(() => {
      // Simulate real parsed receipt from user upload
      const customBill = {
        merchant: file.name.replace(/\.[^/.]+$/, '').toUpperCase() + ' RETAIL',
        date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        invoice: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        category: 'Shopping',
        confidence: '99.4% Match',
        items: [
          { name: '1x Line Item Package A', price: '₹1,250.00' },
          { name: 'GST & Local Taxes', price: '₹140.00', muted: true }
        ],
        total: '₹1,390.00',
        numericTotal: 1390
      };

      renderBillData(customBill);
      if (previewBox) previewBox.style.opacity = '1';

      FinSight.showToast(`✅ Successfully extracted line items from ${file.name}!`, 3500);
    }, 700);
  }

  /**
   * Confirm & Add to Expenses Button
   */
  function initAddExpense() {
    const addBtn = document.getElementById('addParsedTxBtn');
    if (!addBtn) return;

    addBtn.addEventListener('click', () => {
      addBtn.disabled = true;
      addBtn.innerHTML = '<span>⏳ Logging to Ledger...</span>';

      setTimeout(() => {
        // Save to store
        FinSight.store.addTransaction({
          id: `TX-${Date.now()}`,
          merchant: activeBill.merchant,
          desc: activeBill.invoice,
          category: activeBill.category,
          method: 'OCR Auto-Import',
          amount: activeBill.numericTotal,
          type: 'expense',
          date: 'Today, Just now',
          status: 'Completed',
          icon: '🧾'
        });

        // Update parsed count
        const billsCountEl = document.querySelector('.card-purple .card-value');
        if (billsCountEl) {
          const current = 24;
          billsCountEl.textContent = `${current + 1} Documents`;
        }

        addBtn.disabled = false;
        addBtn.innerHTML = '<span>✓ Added to Expenses</span>';
        addBtn.style.background = '#059669';

        FinSight.showToast(`🎉 Logged ${activeBill.merchant} (${activeBill.total}) to verified ledger!`, 4000);

        setTimeout(() => {
          addBtn.innerHTML = '<span>✓ Confirm & Add to Expenses</span>';
          addBtn.style.background = '';
        }, 3000);
      }, 500);
    });
  }

  function init() {
    initSampleButtons();
    initDropzone();
    initAddExpense();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

