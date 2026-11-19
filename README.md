# FinSight — The Smart Wealth Manager

<div align="center">

![FinSight Logo](logo.svg)

### Intelligent Personal Wealth, Cashflow Analytics & Portfolio Management

[![UI: Vanilla HTML5/CSS3](https://img.shields.io/badge/UI-Vanilla%20HTML5%20%2F%20CSS3-3b82f6?style=for-the-badge&logo=html5)](style.css)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20%2F%20No%20Build-10b981?style=for-the-badge&logo=codeforces)](index.html)
[![Responsive: Fluid Layout](https://img.shields.io/badge/Layout-Responsive%20%26%20Fluid-7c3aed?style=for-the-badge&logo=css3)](style.css)
[![Status: Active Development](https://img.shields.io/badge/Status-Feature--Rich%20Prototype-f59e0b?style=for-the-badge)](index.html)

[Overview](#overview) • [Key Features](#key-features) • [Page-by-Page Walkthrough](#page-by-page-walkthrough) • [Design System](#design-system--styling) • [Project Structure](#project-structure) • [Getting Started](#getting-started) • [Roadmap](#roadmap)

</div>

---

## Overview

**FinSight** is a high-density, modern financial intelligence platform and wealth management dashboard tailored for personal finance, multi-account banking, and demat investments. Designed specifically with Indian financial ecosystems in mind (supporting INR ₹, UPI protocols, major banks like HDFC & ICICI, Demat holdings via Zerodha, and Tax Section 80C compliance), FinSight bridges daily expense logging with long-term capital compounding diagnostics.

Built entirely with **semantic HTML5**, **modular Vanilla CSS3**, and **SVG visualizations**, FinSight delivers a blazingly fast, zero-runtime-dependency interface without requiring Node.js build steps, heavy JavaScript runtimes, or external bundlers.

---

## Key Features

### 💼 Unified Wealth & Net Worth Monitoring
- **Consolidated Balance Tracking**: Real-time snapshot of liquid cash reserves, Demat portfolio valuations, and credit lines.
- **Cashflow Health & Run-Rate**: Clear distinction between capital inflow, outbound burn rate, and liquid net capital retained.
- **Goal-Oriented Savings**: Set capital targets, define target completion dates, and monitor savings velocity against monthly allocations.

### 📊 Pure SVG Financial Trend Visualizations
- **Monthly Spending vs. Income Chart**: Interactive SVG bar graphs and dashed trend trajectories visualizing monthly cashflow comparisons.
- **12-Month Trajectory Engine**: Annualized multi-month historical view comparing gross inflows, cumulative expenditures, and net surplus.
- **Top Outflow Breakdown**: Real-time pill indicators detailing primary spending drivers (Food, Retail, Utilities, Commute, Subscriptions).

### 💸 High-Density Reconciled Ledger
- **Multi-Filter Navigation**: Instant sorting by transaction direction (*All*, *Expenses*, *Income*), category classification, and linked accounts.
- **Granular Line-Item Audits**: Detailed metadata for each activity including timestamps, merchant badges, payment channels (e.g., HDFC Millennia, UPI, NEFT, Auto-Debit), and banking reconciliation states.
- **Export Ready**: Pre-wired controls for audit report generation and CSV ledger export.

### 💡 AI-Powered Financial Advisory
- **Leakage Diagnostics**: Proactive flagging of recurring subscription redundancies (e.g., unstreamed digital memberships).
- **Yield Arbitrage**: Automated recommendations for idle cash optimization via Auto-Sweep Fixed Deposits (2.7% vs. 6.8% p.a.).
- **Tax Optimization**: Real-time monitoring of Section 80C deduction headroom (e.g., ELSS deployment advice before financial year close).

### 🧪 FinSight Labs (Upcoming Innovations)
- **🧾 Smart OCR Bill Scanner**: Drag-and-drop document workspace parsing physical receipts, invoices, GSTIN, dates, and itemized sub-totals.
- **🪄 Auto-Categorisation Engine**: Self-learning merchant keyword matcher with confidence scoring and interactive sandbox simulator.
- **⚡ UPI & Payments App Gateway**: Planned real-time webhook sync across Google Pay, PhonePe, CRED, Paytm, and privacy-first on-device SMS parsing.

---

## Page-by-Page Walkthrough

| File | Page Name | Primary Capability |
| :--- | :--- | :--- |
| [`index.html`](index.html) | **Executive Dashboard** | Core KPI cards (Net Worth, Monthly Spend, Savings Rate, Active Budgets), 6-month interactive cashflow SVG chart, recent transactions, and AI advice carousel. |
| [`transactions.html`](transactions.html) | **Transactions Ledger** | Deep-dive transaction search, category & account dropdown filters, reconciliation status, and full transaction history. |
| [`accounts.html`](accounts.html) | **Accounts & Portfolios** | Visual bank cards (HDFC Salary, ICICI Privilege, Zerodha Demat, HDFC Regalia), inter-account fund transfers, and asset allocation split. |
| [`analytics.html`](analytics.html) | **Analytics & Intelligence (Pro)** | Financial Health Score (88/100), 12-month net worth trajectory graph, category spending share, and savings velocity metrics. |
| [`insights.html`](insights.html) | **Smart Financial Insights** | Advisory feed organized by priority with potential annual savings calculators and auto-optimization actions. |
| [`bill-scanner.html`](bill-scanner.html) | **Smart OCR Bill Scanner (Beta)** | Invoice/receipt drag-and-drop dropzone with sample bill testing (Starbucks, Adani Power, Amazon) and parsed line-item inspector. |
| [`auto-categorisation.html`](auto-categorisation.html) | **Auto-Categorisation Engine** | Rule matcher management for Indian merchants, rule builder form, and interactive pattern simulation sandbox. |
| [`payments-integration.html`](payments-integration.html) | **Payments & UPI Gateway** | Gateway connection hubs (GPay, PhonePe, CRED, Paytm) and local on-device bank SMS parser architecture. |

---

## Design System & Styling

FinSight features an expansive, bespoke design system documented in [`style.css`](style.css) (~2,480 lines), incorporating modern UI aesthetics:

### Color Palette & Design Tokens
```css
:root {
  /* Surfaces & Backgrounds */
  --bg-app: #f6f8fb;
  --bg-sidebar: #0f172a;
  --bg-card: #ffffff;
  --bg-subtle: #f8fafc;

  /* Typography */
  --font-primary: 'Plus Jakarta Sans', system-ui, sans-serif;
  --text-main: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;

  /* High-Contrast Financial Accents */
  --color-income: #059669;        /* Inflow & Positive Gains */
  --color-income-bright: #10b981;
  --color-expense: #dc2626;       /* Outflow & Dues */
  --color-expense-bright: #f43f5e;

  /* Brand Accents */
  --brand-purple: #7c3aed;        /* Net Worth & Primary Accents */
  --brand-teal: #0d9488;          /* Demat & Savings */
  --brand-amber: #f59e0b;         /* Budget Overrun Warnings */
  --brand-pink: #e07ab0;          /* Spend Velocity */
}
```

### Architectural Highlights
- **CSS-Only Target Modals**: Modals for *Goal Setting* (`#goalModal`) and *Add Transaction* (`#txModal`) leverage `:target` pseudo-classes for accessible popups without JavaScript overhead.
- **Glassmorphism & Micro-Interactions**: Smooth hover elevations, gradient-bordered bank cards with embossed EMV chips, and reactive category progress bars.
- **Fluid Layout**: Responsive breakpoints adapt navigation and multi-column grids gracefully from ultra-wide displays down to mobile viewports.

---

## Project Structure

```
FinSight/
├── README.md                  # Comprehensive project documentation
├── index.html                 # Main Executive Dashboard & KPI Overview
├── transactions.html          # Comprehensive Transactions Ledger & Search
├── accounts.html              # Bank Accounts, Portfolios & Transfer Hub
├── analytics.html             # Pro Financial Diagnostics & 12M Trajectory
├── insights.html              # AI-Driven Advisory & Savings Recommendations
├── bill-scanner.html          # FinSight Labs: OCR Receipt & Invoice Scanner
├── auto-categorisation.html   # FinSight Labs: ML Classification Rules Engine
├── payments-integration.html  # FinSight Labs: UPI & Banking Gateway Sync
├── style.css                  # Master CSS Design System (2,400+ lines)
└── logo.svg                   # Custom Vector Brand Identity & Wordmark
```

---

## Getting Started

Because FinSight is engineered with pure web standards, no compilation, transpilation, or web server setup is required.

### Quick Launch
1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/nikhiltyagi/FinSight.git
   ```
2. Navigate into the project folder:
   ```bash
   cd FinSight
   ```
3. Open [`index.html`](index.html) in any modern web browser:
   - **macOS**: `open index.html`
   - **Linux**: `xdg-open index.html`
   - **Windows**: `start index.html`

### Development / Local Server (Optional)
If you prefer previewing via a lightweight local server (e.g., Live Server or Python):
```bash
# Python 3
python3 -m http.server 8000

# Node / npx (optional)
npx serve .
```
Then visit `http://localhost:8000` in your browser.

---

## Roadmap

- [x] **Phase 1**: Executive Dashboard with KPI cards and 6-Month SVG Cashflow charts.
- [x] **Phase 2**: Full Transaction Ledger with status tagging and multi-filter criteria.
- [x] **Phase 3**: Multi-Bank representation with inter-account transfers.
- [x] **Phase 4**: Financial Health scoring and annualized cashflow diagnostics.
- [x] **Phase 5**: UI Prototypes for FinSight Labs (OCR Bill Scanner, Auto-Categorisation, UPI Sync).
- [ ] **Phase 6**: Integrate lightweight client-side state management (LocalStorage / IndexedDB) for persisting transactions and user goals.
- [ ] **Phase 7**: Dynamic client-side Tesseract.js integration for real-time in-browser OCR processing.
- [ ] **Phase 8**: Dark mode toggle theme support across all pages.

---

## Author & Credits

- **Creator**: [Nikhil Tyagi](https://github.com/nikhiltyagi)
- **Typography**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) by Tokyo Type
- **Design & Layout**: Handcrafted with Vanilla HTML5 & CSS3

---

<div align="center">
  <sub>FinSight &copy; 2026 Nikhil Tyagi. Crafted for intelligent personal wealth management.</sub>
</div>