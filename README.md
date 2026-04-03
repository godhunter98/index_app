# Worst Timing Investor

A React application simulating what happens if you bought the absolute 52-week peak or absolute 52-week bottom of the Indian stock market every single calendar year for 30 years.

## 🚀 The Premise

This app proves that **time in the market always beats timing the market**. Even the world's most "unlucky" investor who mechanically pumps ₹1,00,000 to buy exactly at the top of the bubble across decades remains heavily profitable through the power of compounding. 

It compares metrics across 5 major indices:
- BSE Sensex
- Nifty 50
- Nifty Next 50
- Nifty Midcap 150
- Nifty Smallcap 250

## ✨ Features

- **Unluckiest vs Luckiest Toggle:** Real empirical data comparing buying at 30 exact 52-week annual highs vs 52-week annual lows.
- **Price Return vs Total Return Index (TRI):** Toggle dividends into the calculations to see exactly how massive cash distributions effect compounding trajectories.
- **Cross-Index Comparison:** Compare compounding multiples side-by-side. 
- **Automated CAGR Solver:** Employs Newton computations mimicking Extended Internal Rate of Return (XIRR) dynamically for precise annualized metrics.

## 🛠 Tech Stack

- **Framework:** React + Vite
- **Styling:** Inline optimized vanilla CSS
- **Typography:** JetBrains Mono

## 💻 Running Locally

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

## 📈 Methodology & Data

The app utilizes precise percentage drawdown metrics algorithmically synthesized directly mapping 1996–2026 overlapping index volatilities from NSE and BSE empirical data. Dividend yields are mathematically estimated over the history of the indices compounded accurately against holding periods.
