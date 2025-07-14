# Product Requirements Document: Forex Trading Diary Web App

## 1. Introduction & Vision

**Product Vision:** To create a simple, intuitive, and powerful web application that allows forex traders to meticulously log, review, and analyze their trading activities. The application will serve as a personal trading diary, helping users identify patterns, refine strategies, and improve their overall trading performance through detailed record-keeping and insightful analytics.

**Target Audience:** Retail forex traders, from novice to experienced, who want a dedicated tool to track their trades and performance across multiple accounts.

---

## 2. Core Features & Functional Requirements

### 2.1. Account Management (Multi-Account Support)

* **FR-101:** Users must be able to create, name, and manage multiple, separate trading accounts within the application (e.g., "Personal Swing Account," "Scalping Test Account").
* **FR-102:** When creating a new trading account, the user must specify the account's currency (e.g., USD, EUR, GBP) and its initial trading balance.
* **FR-103:** The dashboard or a dedicated accounts page should display a summary of all created accounts, showing their names and current balances.

### 2.2. Trade Entry Management

* **FR-201:** Users must be able to create a new trade entry for any of their managed accounts.
* **FR-202:** Each trade entry must contain the following mandatory fields upon creation:
    * **Currency Pair:** A text input or selectable list (e.g., "EUR/USD", "GBP/JPY").
    * **Plan / Direction:** A clear selection between **BUY** or **SELL**.
    * **Rationale:** A text area for the user to describe the strategy, setup, and reasons for entering the trade.
* **FR-203:** Users must be able to upload one or more screenshots (e.g., chart setups before and after) to each trade entry. The UI should support a simple file-upload mechanism.
* **FR-204:** Each trade entry will have an **Outcome** status, which can be one of the following:
    * **Open:** The default status for a new trade.
    * **Win:** The trade was closed with a profit.
    * **Loss:** The trade was closed with a loss.
    * **Break-Even:** The trade was closed at the entry price.
* **FR-205:** Users must be able to update an "Open" trade to set its final outcome (Win/Loss/Break-Even) at a later time.
* **FR-206:** When the **Outcome** is updated from "Open", the following fields must be populated:
    * **P/L (Profit/Loss):** A numeric input for the final profit or loss amount in the account's currency. A positive value indicates a win, a negative value indicates a loss.
    * **Retrospective:** A mandatory text area for the user to reflect on the trade's execution, what went well, what could be improved, and lessons learned.

### 2.3. Reporting & Analytics Tab

The application must feature a comprehensive "Reports" tab that provides insights into trading performance. All analytics should be filterable by a specific trading account and a date range (e.g., Last 7 Days, This Month, All Time).

* **FR-301: Key Performance Indicators (KPIs)**
    * **Total Performance (P/L):**
        * Display the total net profit or loss in absolute money (e.g., +$1,520 or -$850).
        * Display the total net profit or loss as a percentage of the initial account balance.
    * **Profit Ratio (Win Rate):** Display the percentage of winning trades out of all closed trades (e.g., `(Number of Wins / Total Closed Trades) * 100`).
    * **Average Trade:**
        * Calculate and display the average monetary value of a winning trade.
        * Calculate and display the average monetary value of a losing trade.
    * **Risk/Reward Ratio:** Display the average ratio of the amount won in profitable trades versus the amount lost in losing trades.
* **FR-302: Top Performers**
    * **Best Trade:** Identify and display the single trade with the highest monetary profit.
    * **Worst Trade:** Identify and display the single trade with the largest monetary loss.
* **FR-303: Trade History Table**
    * Display a detailed, sortable table of all trade entries.
    * Columns should include: Date, Currency Pair, Plan (Buy/Sell), P/L, Outcome.
    * The table must be filterable by **Currency Pair**.
* **FR-304: Performance by Currency Pair**
    * Display a breakdown of performance for each traded currency pair.
    * For each pair (e.g., EUR/USD), show:
        * Total P/L for that pair.
        * Number of trades.
        * Win Rate for that pair.

---

## 3. Non-Functional Requirements

* **NFR-1: Design & Usability**
    * **NFR-1.1 (Responsive Design):** The application layout must be fully responsive and provide a seamless, optimized experience on both desktop and mobile devices. Elements should reflow and resize gracefully.
    * **NFR-1.2 (Intuitive UI):** The user interface should be clean, modern, and easy to navigate. Key actions like adding a new trade or viewing reports should be immediately accessible.
* **NFR-2: Performance**
    * **NFR-2.1 (Fast Load Times):** The application should load quickly, even with a large number of trade entries. Analytics calculations should be performed efficiently.

---

## 4. Future Considerations (Out of Scope for V1)

* Integration with broker APIs to automatically import trade history.
* Advanced charting tools to visualize equity curves.
* Strategy tagging and performance analysis by strategy.
* Public, shareable trade logs or performance reports.