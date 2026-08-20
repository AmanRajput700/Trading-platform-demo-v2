# Trading Platform — Frontend UI Demo Specification

**Type:** Frontend-only demo (no backend, no real broker auth, no live orders, no real money)
**Market:** India (NSE, BSE, indices, F&O, options)
**Goal:** Prove one product idea end-to-end — *build a strategy, find matching instruments, understand the signal, take a simulated action.*

> **Build agent note:** This document is the source of truth for scope, structure, and design direction. Where this doc gives a concrete value (color hex, font, spacing unit, copy line), use it exactly. Where it leaves something open, make a deliberate, specific choice and stay consistent with it — don't default to generic dashboard/SaaS patterns. See **Section 0** before writing any UI code.

---

## 0. Design Mandate — Read This First

The single biggest risk on this project is that it ends up looking like *"a generic AI-generated fintech dashboard."* That look has a signature, and it must be avoided on purpose:

**Avoid, specifically:**
- Purple/indigo-to-blue gradients anywhere (buttons, headers, hero sections, card backgrounds)
- Glowing/neon card borders, glassmorphism, frosted-blur panels
- Oversized rounded-pill buttons and pill-shaped stat cards
- Big centered hero numbers with a soft gradient blob behind them
- Generic dashboard grid of 6 identical elevated cards with icon-in-a-tinted-circle
- Default shadcn/Tailwind spacing with no opinion (everything `rounded-xl shadow-md p-6`, same corner radius everywhere)
- Emoji used as UI icons (no 🔔 as a real notification icon, no 🟢/🔴 as status dots — use real iconography)
- Every metric wrapped in a card with a drop shadow "for depth"
- Placeholder icons where a real financial iconography set (Lucide/Feather-style line icons) should be used consistently

**Do this instead — build in an opinionated visual identity:**

This should read like a product a small, senior fintech design team shipped — closer to **Kite/Groww/Bloomberg Terminal lineage** than to a "startup dashboard template." Concretely:

- **One accent color used sparingly and intentionally**, not decoratively. Green/red carry P&L and Buy/Sell meaning — they are *data*, not brand color. The brand accent (see palette below) should show up only on primary actions, the active nav item, and selection states — nowhere else.
- **Borders over shadows.** Prefer a 1px `border` in a muted gray to separate regions of the UI. Reserve shadow for genuinely elevated surfaces (dropdowns, modals, the order ticket) — one consistent shadow token, not shadow-per-card.
- **Numeric typography matters more than any icon.** Price, P&L, and RSI values should sit in a tabular-figure monospace or semi-condensed numeric face so a column of numbers lines up and reads like a terminal, not like marketing copy.
- **Density with rhythm.** This is a trading tool. Tables are dense. Rows are compact (32–36px), not airy 56px SaaS rows. But keep a consistent 4/8px spacing grid so density reads as "considered," not "cramped."
- **Micro-imperfections that read as human, not templated:**
  - Timestamps and "last synced" text in a slightly lighter/smaller weight than surrounding text, always present, never omitted (real trading tools are obsessive about data freshness).
  - Numbers that don't round too cleanly (₹1,482.30 not ₹1,500) — realistic mock data, not designer-round numbers.
  - Real copy in empty/error states, written from the user's side of the screen (see Section 34/36) — not "Oops! Something went wrong 🙈."
  - Subtle, purposeful motion only: a price flashing green/red for ~400ms on tick change, a row highlight fade after a new order fills, a chart line drawing in once on load. No page-load fade-ins on every element, no hover-scale on cards, no confetti.
- **One signature moment.** Pick a single element that this product is remembered by. Recommended: the **"Why this matched" signal explanation** (Section 17) — a small, checklist-style component with terse, confident language and real indicator values, rendered consistently across the results table, instrument detail page, and chart annotation. Make it the most polished, considered component in the app. Everything else stays disciplined around it.

### 0.1 Concrete Design Tokens

Use these as defaults; treat them as a starting palette to refine, not a suggestion to ignore.

**Color**
| Token | Hex | Use |
|---|---|---|
| `bg-base` | `#FAFAF9` | App background (off-white, slightly warm, not pure white) |
| `bg-surface` | `#FFFFFF` | Cards, tables, panels |
| `bg-sunken` | `#F2F1EF` | Table header rows, sidebar background |
| `text-primary` | `#171412` | Headings, primary data |
| `text-secondary` | `#6B6560` | Labels, captions, metadata |
| `border-default` | `#E5E2DD` | 1px hairline borders everywhere |
| `accent-primary` | `#1F5FBF` | Primary buttons, active nav, links, selected state (a confident, slightly desaturated blue — not a bright SaaS blue) |
| `positive` | `#0F8A5F` | Gains, Buy, profit |
| `positive-bg` | `#E7F5EE` | Subtle positive background tint (badges only) |
| `negative` | `#C13A2E` | Losses, Sell, loss |
| `negative-bg` | `#FBEAE8` | Subtle negative background tint (badges only) |
| `warning` | `#B5790A` | Pending, watch signals |
| `warning-bg` | `#FBF1DF` | Warning background tint |

Do not use pure black (`#000`) or pure saturated red/green (`#F00`/`#0F0`) anywhere — they read as default/unstyled.

**Typography**
- **Display / headings:** A grotesk with some character, not the default system stack — e.g. `"Inter Tight"`, `"Söhne"`, or `"General Sans"`. Weight 600, tight tracking, no italics.
- **Body / UI:** A neutral, highly legible grotesk — `"Inter"` or `"IBM Plex Sans"`. Weight 400–500 only. Avoid using the same face for both display and numerals if it doesn't have real tabular figures.
- **Numeric / data (prices, P&L, indicators, order tickets):** A face with true tabular lining figures — `"IBM Plex Mono"`, `"JetBrains Mono"`, or `"Inter"` with `font-variant-numeric: tabular-nums` enabled. This is not optional for a trading UI — misaligned digits in a price column is the single fastest way to look unpolished.
- Type scale: keep it tight — 12 / 13 / 14 / 16 / 20 / 28px. Don't introduce a 48px hero number anywhere in this product; it isn't a marketing site.

**Spacing & Shape**
- Base unit: 4px, stepped in 4/8/12/16/24/32.
- Table rows: 32–36px height, 12px horizontal padding.
- Corner radius: 6px for cards/inputs/buttons, 4px for badges/pills used for signal tags. Never use fully-rounded pill buttons for primary actions.
- Shadow: exactly one elevation token for floating surfaces (dropdowns, modals, toasts) — e.g. `0 4px 16px rgba(23,20,18,0.08)`. Flat surfaces (cards, tables) use a border, never a shadow.

**Iconography**
- Use a single consistent line-icon set (Lucide is fine) at 16/20px, 1.5px stroke, `text-secondary` color by default, `accent-primary` or semantic color only on active/meaningful state. No filled icons, no emoji.

---

## 1. Reference Products (inspiration, not templates)

| Product | Take from it |
|---|---|
| **Groww** | Simplicity, discoverability, approachable first-time-investor tone |
| **Zerodha Kite** | Trading information density, order workflow, positions/holdings structure |
| **TradingView** | Charting, technical analysis, market visualization |

Combine into something that feels like its own product: **Groww's simplicity + Kite's trading workflow + TradingView's analytical depth** — not a visual copy of any of them.

---

## 2. Design Principles (functional)

**Do:** clear hierarchy, strong typography, subtle borders, restrained color, consistent spacing, compact readable tables, contextual actions, reusable components, predictable navigation.

**Avoid:** unnecessary panels, excessive menus, deep navigation, over-configuration, huge numbers of cards, decorative gradients, excessive animation, glassmorphism, overly colorful dashboards.

The interface should feel like it was designed by a small, senior human product team — not generated from a generic dashboard template.

---

## 3. Information Architecture

### Primary navigation
- Dashboard
- Strategies
- Market
- Orders
- Positions
- Holdings

### Secondary navigation
- Funds
- Broker Connections
- Settings

### Always-accessible actions
- **+ Create Strategy** — visible from Dashboard, Strategies, and Market
- **Buy / Sell** — visible on any instrument context

### Navigation philosophy
Don't force users through a fixed multi-step funnel like `Dashboard → Market → Stock → Strategy → Results → Order`. Instead, support contextual jumps:

```
Strategy Results → RELIANCE → [View Chart] [Buy]
Search → RELIANCE → Chart + Strategy Match + Buy
```

The user should always be able to move from *discovery* to *action* in as few clicks as possible.

---

## 4. Dashboard

### Header
```
[Logo]    Search stocks, indices, options...          NSE: OPEN   🔔   User
```
- Left: product logo/name
- Center: global search (see Section 9)
- Right: market status pill, notifications, user menu

### Portfolio summary
Simple metric blocks — not decorative cards:
```
Portfolio Value       ₹8,42,650
Today's P&L           +₹12,450
Overall P&L           +₹64,320
Available Funds       ₹2,15,000
```

### Market overview
```
NIFTY 50       25,420.35     +0.72%
SENSEX         83,540.20     +0.64%
BANK NIFTY     57,320.40     +1.12%
NIFTY IT       41,230.15     -0.18%
```
Plus compact tables for **Top Gainers**, **Top Losers**, **Most Active**.

### Strategy overview
Show recently created strategies, each with name, status, last run, match count, and Run / Edit / More actions:
```
My Strategies

Momentum Breakout      Status: Active   Last Run: 2 min ago    Matches: 7
RSI Reversal           Status: Active   Last Run: 5 min ago    Matches: 12
Moving Average Cross   Status: Paused   Last Run: Yesterday    Matches: 0
```

---

## 5. Strategy Builder

Core product feature. No-code condition builder.

### Header
```
Create Strategy

Strategy Name     [ Momentum Breakout ]
Market            [ NSE ▼ ]
Instrument Type   [ Stocks ▼ ]
Timeframe         [ 15 min ▼ ]
```

### Conditions
Each condition is a readable row:
```
WHEN
[ RSI ] [ < ] [ 30 ]
AND
[ Close Price ] [ > ] [ SMA 20 ]
AND
[ Volume ] [ > ] [ Average Volume × 1.5 ]
```
Actions: **Add Condition**, **Add Group**, **Delete Condition**.

### Logic
Support `AND` / `OR` with grouped, nested conditions, rendered so nesting is visually obvious (indentation + a subtle vertical rule connecting grouped rows, not just parentheses in text):
```
( RSI < 30 AND Close > EMA 20 )
OR
( MACD crosses above Signal AND Volume > Average Volume )
```

### Available indicators (demo uses realistic predefined results, not real calculations)
- **Trend:** SMA, EMA, WMA, VWAP, MACD, ADX
- **Momentum:** RSI, Stochastic, CCI, ROC
- **Volatility:** Bollinger Bands, ATR
- **Volume:** Volume, Average Volume, OBV
- **Price:** Open, High, Low, Close, Previous Close, % Change

### Actions
```
[ Save Strategy ]     [ Run Strategy ]
```

On Run:
```
Scanning NSE/BSE...
2,146 instruments scanned
17 instruments matched your strategy
```
Then show results in the same workspace (no full page navigation away from context).

---

## 6. Strategy Results

One of the most important screens in the product.

```
Momentum Breakout
17 Matching Instruments
Last Run: 10:42:31 AM
```

### Filters
```
Market   NSE ▼      Type   All ▼      Signal   All ▼      Sort   Relevance ▼
```

### Results table
| Instrument | Price | Change | Signal | RSI | Volume | Strategy Match |
|---|--:|--:|---|--:|--:|---|
| RELIANCE | ₹1,482.30 | +2.41% | BUY | 34.2 | 1.8x | 3/3 |
| HDFCBANK | ₹1,965.10 | +1.82% | BUY | 31.8 | 2.1x | 3/3 |
| INFY | ₹1,742.20 | +1.24% | BUY | 38.4 | 1.5x | 3/3 |
| TCS | ₹3,924.50 | +0.91% | WATCH | 41.2 | 1.1x | 2/3 |

Every row must let the user answer, at a glance: *What matched? Why did it match? What's the price? What can I do about it?* Don't overload the table beyond this.

### Signal explanation (the signature component — see Section 0)
```
Why this matched
✓ RSI below 35
✓ Price above 20 EMA
✓ Volume 1.8× average

Signal: BUY
```
Users should never have to interpret raw indicator values themselves — always pair the number with the plain-language reason.

---

## 7. Instrument Detail

```
RELIANCE
Reliance Industries Ltd.

₹1,482.30
+₹34.80  +2.41%

NSE
```
Actions: `[ Buy ] [ Sell ]`

### Chart
Largest component on the page.
- Candlestick chart + volume
- Timeframe selector: `1m 5m 15m 30m 1H 1D 1W`
- A focused set of indicators (not TradingView's entire toolbox)
- Basic drawing tools, zoom, full-screen
- Static/mock chart data is fine for the demo

### Strategy signal on chart
If the instrument matched a strategy, show the context and optionally mark the signal point on the chart:
```
Momentum Breakout
Matched at 10:31 AM

RSI: 32.4
EMA20: ₹1,461.20
Volume: 1.9× Average
```

### Instrument information (tabs)
- **Overview:** market cap, sector, 52W high/low, open, previous close, day high/low, volume
- **Fundamentals** (where mock data supports it): P/E, EPS, dividend yield, book value, ROE, debt/equity
- **Technicals:** RSI, MACD, EMA, SMA, VWAP, ATR, Bollinger Bands

Never render unavailable data as fake in a way that misrepresents the real production architecture — for this demo, clearly use realistic mock values.

---

## 8. Options

Support from the start — this is an Indian market platform.

```
NIFTY 50
25,420.35

Option Chain
```

Columns, calls and puts clearly separated by the strike column:
```
CALLS: OI | OI Change | Volume | IV | LTP | Bid | Ask     STRIKE     PUTS: LTP | Bid | Ask | IV | Volume | OI Change | OI
```

---

## 9. Global Search

Accessible from anywhere via the header.

```
Search stocks, indices, options...

REL
────────────────────
RELIANCE   Reliance Industries   NSE
RELIANCE   Reliance Industries   BSE
```
Categories: Stocks, Indices, Futures, Options. A user should be able to reach an instrument directly from search without navigating through intermediate pages.

---

## 10. Market Page

General discovery screen, independent of any strategy:
- **Indices:** NIFTY 50, BANK NIFTY, FINNIFTY, SENSEX, NIFTY IT
- **Top Gainers**
- **Top Losers**
- **Most Active**
- **Sector Performance**
- **Option Activity**

---

## 11. Order Flow

### Order panel (compact, not a complex ticket)
```
BUY RELIANCE

Price              [ Market ▼ ]
Quantity           [ 10 ]
Estimated Value    ₹14,823
Product            [ CNC ▼ ]

[ Place Buy Order ]
```

Derivatives variant:
```
BUY NIFTY 25,500 CE

Order Type    [ Market ▼ ]
Quantity      [ 75 ]

[ Place Buy Order ]
```

### Confirmation
```
Review Order

BUY  RELIANCE
Quantity      10
Order Type    Market
Product       CNC
Estimated     ₹14,823

[ Cancel ]       [ Confirm Buy ]
```

After confirming (simulated only):
```
Order placed
Order ID: ORD-20260820-10421
Status: Submitted
```

---

## 12. Orders Page

**Open Orders:** Order ID, Instrument, Side, Quantity, Price, Order Type, Status, Time, Actions
**Statuses:** Pending, Submitted, Partially Filled, Filled, Cancelled, Rejected
**Order History filters:** Date, Instrument, Status, Buy/Sell

---

## 13. Positions

| Instrument | Qty | Avg. Price | LTP | P&L | Day P&L |
|---|--:|--:|--:|--:|--:|
| RELIANCE | 10 | ₹1,450 | ₹1,482 | +₹323 | +₹145 |
| NIFTY FUT | 75 | ₹25,320 | ₹25,420 | +₹7,500 | +₹2,250 |

Actions: Exit, Buy More, Sell More, View Details

---

## 14. Holdings

Fields: Instrument, Quantity, Average Price, Current Price, Invested Value, Current Value, Total Return, Today's Return. Shown separately from trading Positions.

---

## 15. Funds / Account

- **Funds:** available cash, used margin, available margin, collateral, pay-in, pay-out
- **Margin:** equity margin, futures margin, options margin, used margin, available margin
- **Account:** trading account status, segment availability, broker name, last synchronized time

Keep fields flexible — different brokers expose different data shapes later.

---

## 16. Broker Connections (settings page, no real auth in this demo)

```
Broker Connections

Connect a broker to trade directly from this platform.

[ Add Broker ]

Supported integrations
--------------------------------
Broker A       Connected
Broker B       Not Connected
Broker C       Not Connected
```

Conceptual architecture the frontend should assume (no need to build the backend):
```
Frontend → Trading Backend → Broker Adapter Layer → Broker API
```
The frontend must not hard-code assumptions about any single broker.

---

## 17. Empty / Loading / Error States

**Empty (no strategies):**
```
No strategies yet
Create your first strategy to scan the market and find matching instruments.
[ Create Strategy ]
```

**Empty (no matches):**
```
No instruments matched
Your strategy was scanned across 2,146 instruments.
Try adjusting your conditions.
[ Edit Strategy ]
```

**Loading:** use skeleton loaders for market data, charts, positions, holdings, orders, and strategy results. No full-page spinners.

**Error (market data):**
```
Market data unavailable
We couldn't refresh the latest market data.
Last updated: 10:42:18 AM
[ Retry ]
```

**Error (broker):**
```
Broker connection unavailable
We couldn't synchronize your trading account.
Your existing data is still available.
[ Retry Connection ]
```

Write every empty/error/loading state from the user's side of the screen: say what happened and what to do next, in plain terms — never "Oops!" or an apology, and never vague about the cause.

---

## 18. Demo Data

Realistic mock Indian market data only — non-round numbers, believable spreads.

- **Stocks:** RELIANCE, HDFCBANK, ICICIBANK, INFY, TCS, SBIN, LT, ITC, BHARTIARTL, AXISBANK
- **Indices:** NIFTY 50, BANK NIFTY, FINNIFTY, SENSEX, NIFTY IT
- **Options:** realistic strikes, expiries, LTP, IV, OI, volume, bid/ask

---

## 19. Component Inventory

**Navigation:** Sidebar, TopBar, GlobalSearch, MarketStatus, UserMenu
**Market:** MarketIndexCard, MarketTable, InstrumentRow, PriceChange, Watchlist
**Strategy:** StrategyCard, StrategyBuilder, ConditionRow, IndicatorSelector, OperatorSelector, StrategyResultTable, SignalBadge, MatchExplanation
**Trading:** Chart, OrderPanel, OrderConfirmation, PositionTable, HoldingsTable, OrderTable, PnLDisplay
**Account:** FundsSummary, MarginBreakdown, BrokerConnectionCard

---

## 20. Suggested Project Structure

```
src/
├── components/
│   ├── common/
│   ├── navigation/
│   ├── market/
│   ├── strategy/
│   ├── trading/
│   └── account/
│
├── pages/
│   ├── Dashboard/
│   ├── Strategies/
│   ├── StrategyBuilder/
│   ├── Market/
│   ├── Instrument/
│   ├── Orders/
│   ├── Positions/
│   ├── Holdings/
│   ├── Funds/
│   └── Settings/
│
├── mock/
│   ├── marketData/
│   ├── strategies/
│   ├── orders/
│   ├── positions/
│   └── holdings/
│
└── services/
    └── api/
```

Modular structure — avoid one huge dashboard component.

---

## 21. End-to-End Demo Flow (the one journey that must work perfectly)

1. Open **Dashboard** → see market status, portfolio, active strategies, recent positions/orders.
2. Click **Create Strategy**.
3. Build:
   ```
   Momentum Breakout
   RSI < 35
   AND Price > EMA 20
   AND Volume > Average Volume × 1.5
   ```
4. Click **Run Strategy** → `2,146 instruments scanned` → `17 matches found`.
5. Select **RELIANCE** from results.
6. See price, chart, strategy match context, indicator values, signal explanation, Buy/Sell.
7. Click **Buy** → compact order ticket appears.
8. Confirm order.
9. See the order appear in **Orders**, and the position update in **Positions**.

This single flow must communicate the full product concept on its own.

---

## 22. Explicitly Out of Scope for v1

Do not build these merely to make the app look bigger — they can come later:
- Real broker authentication or real order execution
- Complex risk management
- Advanced algo deployment
- Backtesting engine / paper trading engine
- Social trading / copy trading
- Complex multi-leg options strategies
- Advanced charting-drawing systems
- Dozens of technical indicators
- Complex portfolio analytics

---

## 23. Primary UX Goal (north star)

> *"I have a trading idea. Can I express it as a strategy, quickly find the instruments that match it, understand why they matched, and take action?"*

Everything in the interface should be justified against this question. This is a **strategy-driven trading platform**, not another stock market dashboard.

## 24. Final Direction Checklist

- [ ] Professional enough for an active trader
- [ ] Simple enough for a first-time investor to follow
- [ ] Dense enough to expose real market information
- [ ] Clean enough that no screen feels overwhelming
- [ ] Personality comes from typography, spacing, layout, and one signature component — not gradients, oversized cards, or animation
- [ ] Nothing in the build matches the "generic AI dashboard" patterns listed in Section 0
- [ ] Desktop is the priority; collapse gracefully on smaller screens (secondary panels collapse first, search and Buy/Sell always stay reachable, tables become horizontally scrollable rather than reflowing into card lists)
