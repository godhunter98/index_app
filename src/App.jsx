import { useState, useMemo } from "react";

/*
══════════════════════════════════════════════════════════════════════
  "WORST TIMING" INVESTOR — ₹1 Lakh/Year at 52-Week High
  Indices: BSE Sensex, Nifty 50, Nifty Next 50, Nifty Midcap 150, Nifty Smallcap 250
  
  52-Week Highs sourced from: NSE / BSE / niftyindices.com / Wikipedia
  Current values as of Apr 2, 2026
  
  TRI estimated using historical avg annual dividend yields
  applied as a compounding factor from buy year to present.
══════════════════════════════════════════════════════════════════════
*/

const CURRENT_SENSEX = 74683;        // BSE Sensex
const CURRENT_NIFTY50 = 22713;       // Apr 2, 2026
const CURRENT_NEXT50 = 64927;
const CURRENT_MIDCAP150 = 19953;     // Nifty Midcap 150
const CURRENT_SMALLCAP250 = 14655;   // Nifty Smallcap 250

// Avg annual dividend yields for TRI approximation
const DIV_YIELD = { sx: 0.0145, n50: 0.015, nn50: 0.0159, mid: 0.0085, sml: 0.008 };

// ─── 52-Week Highs (Calendar Year) ───────────────────────────
// Nifty 50: well documented from NSE/Wikipedia
const DATA = [
  { year: 1996, sx: { h: 4100, l: 3200 }, n50: { h: 1186, l: 926 }, nn50: { h: null, l: null }, mid: { h: null, l: null }, sml: { h: null, l: null }, context: "Index launched, early days" },
  { year: 1997, sx: { h: 4605, l: 3248 }, n50: { h: 1278, l: 901 }, nn50: { h: null, l: null }, mid: { h: null, l: null }, sml: { h: null, l: null }, context: "Asian contagion fears" },
  { year: 1998, sx: { h: 4322, l: 2741 }, n50: { h: 1252, l: 794 }, nn50: { h: null, l: null }, mid: { h: null, l: null }, sml: { h: null, l: null }, context: "Global EM sell-off, sanctions" },
  { year: 1999, sx: { h: 5151, l: 3104 }, n50: { h: 1491, l: 898 }, nn50: { h: null, l: null }, mid: { h: null, l: null }, sml: { h: null, l: null }, context: "IT boom begins, Kargil war" },
  { year: 2000, sx: { h: 6151, l: 3492 }, n50: { h: 1818, l: 1032 }, nn50: { h: 2450, l: 1391 }, mid: { h: null, l: null }, sml: { h: null, l: null }, context: "Dotcom peak / Y2K euphoria" },
  { year: 2001, sx: { h: 4462, l: 2595 }, n50: { h: 1264, l: 735 }, nn50: { h: 1780, l: 1035 }, mid: { h: null, l: null }, sml: { h: null, l: null }, context: "9/11 shock, market crash" },
  { year: 2002, sx: { h: 3758, l: 2828 }, n50: { h: 1130, l: 850 }, nn50: { h: 1520, l: 1144 }, mid: { h: null, l: null }, sml: { h: null, l: null }, context: "Prolonged bear market" },
  { year: 2003, sx: { h: 5921, l: 2904 }, n50: { h: 1880, l: 922 }, nn50: { h: 2800, l: 1374 }, mid: { h: null, l: null }, sml: { h: null, l: null }, context: "Recovery rally" },
  { year: 2004, sx: { h: 6617, l: 4228 }, n50: { h: 2081, l: 1329 }, nn50: { h: 3600, l: 2300 }, mid: { h: null, l: null }, sml: { h: null, l: null }, context: "India Shining, FII inflows" },
  { year: 2005, sx: { h: 9443, l: 6069 }, n50: { h: 2837, l: 1823 }, nn50: { h: 5450, l: 3503 }, mid: { h: 3200, l: 1897 }, sml: { h: 3100, l: 1744 }, context: "FII inflows surge" },
  { year: 2006, sx: { h: 14035, l: 8799 }, n50: { h: 3967, l: 2487 }, nn50: { h: 10100, l: 6332 }, mid: { h: 4950, l: 2856 }, sml: { h: 5200, l: 2844 }, context: "Massive bull run, 10K Sensex" },
  { year: 2007, sx: { h: 20498, l: 12316 }, n50: { h: 6186, l: 4482 }, nn50: { h: 14789, l: 8886 }, mid: { h: 7200, l: 3966 }, sml: { h: 7500, l: 3906 }, context: "Pre-GFC peak" },
  { year: 2008, sx: { h: 21207, l: 7697 }, n50: { h: 6288, l: 2253 }, nn50: { h: 14200, l: 5154 }, mid: { h: 6800, l: 2128 }, sml: { h: 6900, l: 1952 }, context: "GFC bought at peak, 50%+ crash" },
  { year: 2009, sx: { h: 17531, l: 8047 }, n50: { h: 5201, l: 2539 }, nn50: { h: 11900, l: 5462 }, mid: { h: 5400, l: 2209 }, sml: { h: 4700, l: 1781 }, context: "Recovery from GFC lows" },
  { year: 2010, sx: { h: 21076, l: 15652 }, n50: { h: 6312, l: 4675 }, nn50: { h: 13460, l: 9996 }, mid: { h: 7100, l: 4918 }, sml: { h: 6300, l: 4175 }, context: "Post-GFC new highs" },
  { year: 2011, sx: { h: 20665, l: 15136 }, n50: { h: 6181, l: 4531 }, nn50: { h: 12550, l: 9192 }, mid: { h: 6500, l: 4436 }, sml: { h: 5600, l: 3654 }, context: "Euro-zone crisis, sideways" },
  { year: 2012, sx: { h: 19612, l: 15641 }, n50: { h: 5965, l: 4676 }, nn50: { h: 12800, l: 10208 }, mid: { h: 6600, l: 4933 }, sml: { h: 5100, l: 3659 }, context: "Sideways market" },
  { year: 2013, sx: { h: 21484, l: 17449 }, n50: { h: 6415, l: 5119 }, nn50: { h: 14050, l: 11411 }, mid: { h: 7100, l: 5411 }, sml: { h: 5200, l: 3807 }, context: "Taper tantrum dip" },
  { year: 2014, sx: { h: 28822, l: 19963 }, n50: { h: 8588, l: 5933 }, nn50: { h: 19200, l: 13298 }, mid: { h: 10000, l: 6426 }, sml: { h: 7200, l: 4411 }, context: "Modi wave, multiple ATHs" },
  { year: 2015, sx: { h: 30025, l: 24834 }, n50: { h: 8996, l: 7540 }, nn50: { h: 21100, l: 17452 }, mid: { h: 12500, l: 9714 }, sml: { h: 8600, l: 6425 }, context: "30K Sensex, rate cut optimism" },
  { year: 2016, sx: { h: 29077, l: 22495 }, n50: { h: 8970, l: 6826 }, nn50: { h: 21700, l: 16787 }, mid: { h: 12000, l: 8683 }, sml: { h: 8200, l: 5688 }, context: "Demonetisation year" },
  { year: 2017, sx: { h: 34138, l: 26447 }, n50: { h: 10531, l: 8134 }, nn50: { h: 28800, l: 22312 }, mid: { h: 16300, l: 11813 }, sml: { h: 12300, l: 8545 }, context: "GST & reform rally" },
  { year: 2018, sx: { h: 38990, l: 32484 }, n50: { h: 11738, l: 9952 }, nn50: { h: 32650, l: 27202 }, mid: { h: 17900, l: 14018 }, sml: { h: 13100, l: 9866 }, context: "NBFC crisis late in year" },
  { year: 2019, sx: { h: 41810, l: 35287 }, n50: { h: 12294, l: 10584 }, nn50: { h: 30500, l: 25742 }, mid: { h: 16200, l: 12863 }, sml: { h: 10400, l: 7945 }, context: "Pre-COVID all-time high" },
  { year: 2020, sx: { h: 47897, l: 25639 }, n50: { h: 14024, l: 7511 }, nn50: { h: 33400, l: 17879 }, mid: { h: 17100, l: 8299 }, sml: { h: 10200, l: 4644 }, context: "COVID crash V-shaped recovery" },
  { year: 2021, sx: { h: 62245, l: 46160 }, n50: { h: 18477, l: 13597 }, nn50: { h: 45860, l: 34009 }, mid: { h: 23400, l: 16183 }, sml: { h: 15100, l: 9990 }, context: "Post-COVID boom, liquidity surge" },
  { year: 2022, sx: { h: 63583, l: 50921 }, n50: { h: 18887, l: 15183 }, nn50: { h: 45000, l: 36039 }, mid: { h: 23100, l: 17345 }, sml: { h: 15600, l: 11245 }, context: "Rate hike headwinds" },
  { year: 2023, sx: { h: 72484, l: 57085 }, n50: { h: 21802, l: 16828 }, nn50: { h: 54100, l: 42606 }, mid: { h: 26500, l: 19545 }, sml: { h: 17800, l: 12594 }, context: "ATH zone, 70K Sensex" },
  { year: 2024, sx: { h: 85978, l: 70002 }, n50: { h: 26277, l: 21137 }, nn50: { h: 78700, l: 64076 }, mid: { h: 32700, l: 24989 }, sml: { h: 19650, l: 14427 }, context: "All-time high Sep 2024" },
  { year: 2025, sx: { h: 86159, l: 71425 }, n50: { h: 26277, l: 21744 }, nn50: { h: 78700, l: 65242 }, mid: { h: 32700, l: 25473 }, sml: { h: 19650, l: 14718 }, context: "Tariff-led pullback from ATH" },
];

function calculateCAGR(rows, totalValue) {
  if (!rows || rows.length === 0 || totalValue <= 0) return 0;
  let low = -0.99;
  let high = 100.0;
  let guess = 0;
  for (let i = 0; i < 50; i++) {
    guess = (low + high) / 2;
    let fv = 0;
    for (const r of rows) {
      const yearsHeld = 2026.25 - r.year;
      fv += r.invested * Math.pow(1 + guess, yearsHeld);
    }
    if (fv > totalValue) {
      high = guess;
    } else {
      low = guess;
    }
  }
  return guess * 100;
}

function computeTable(indexKey, currentPrice, divYield, isLuckiest) {
  let totalInvested = 0;
  let totalCurrentPrice = 0;
  let totalCurrentTRI = 0;
  
  const rows = DATA
    .filter(d => d[indexKey].h !== null)
    .map(d => {
      const invested = 100000;
      const buyPrice = isLuckiest ? d[indexKey].l : d[indexKey].h;
      const yearsHeld = 2026.25 - d.year;
      
      const priceMultiple = currentPrice / buyPrice;
      const currentValuePrice = Math.round(invested * priceMultiple);
      
      const triMultiple = priceMultiple * Math.pow(1 + divYield, yearsHeld);
      const currentValueTRI = Math.round(invested * triMultiple);
      
      totalInvested += invested;
      totalCurrentPrice += currentValuePrice;
      totalCurrentTRI += currentValueTRI;
      
      return {
        year: d.year,
        high52: d[indexKey].h,
        low52: d[indexKey].l,
        buyPrice: buyPrice,
        context: d.context,
        invested,
        currentValuePrice,
        currentValueTRI,
        priceMultiple: priceMultiple.toFixed(2),
        yearsHeld: Math.round(yearsHeld),
      };
    });
  
  const cagrPrice = calculateCAGR(rows, totalCurrentPrice);
  const cagrTRI = calculateCAGR(rows, totalCurrentTRI);

  return { rows, totalInvested, totalCurrentPrice, totalCurrentTRI, cagrPrice, cagrTRI };
}

function fmt(n) {
  if (n === null || n === undefined) return "—";
  return "₹" + n.toLocaleString("en-IN");
}

function fmtLakh(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return fmt(n);
}

const TAB_CONFIG = [
  { key: "sx", label: "BSE Sensex", current: CURRENT_SENSEX, div: DIV_YIELD.sx, color: "#10b981" },
  { key: "n50", label: "Nifty 50", current: CURRENT_NIFTY50, div: DIV_YIELD.n50, color: "#3b82f6" },
  { key: "nn50", label: "Nifty Next 50", current: CURRENT_NEXT50, div: DIV_YIELD.nn50, color: "#8b5cf6" },
  { key: "mid", label: "Midcap 150", current: CURRENT_MIDCAP150, div: DIV_YIELD.mid, color: "#f59e0b" },
  { key: "sml", label: "Smallcap 250", current: CURRENT_SMALLCAP250, div: DIV_YIELD.sml, color: "#ef4444" },
];

export default function WorstTimingInvestor() {
  const [activeTab, setActiveTab] = useState(0);
  const [showTRI, setShowTRI] = useState(false);
  const [isLuckiest, setIsLuckiest] = useState(false);
  const [theme, setTheme] = useState('dark');
  
  // Apply theme to document
  useMemo(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);
  
  const allResults = useMemo(() => 
    TAB_CONFIG.map(t => computeTable(t.key, t.current, t.div, isLuckiest)), [isLuckiest]
  );

  
  const config = TAB_CONFIG[activeTab];
  const result = allResults[activeTab];
  const years = result.rows.length;
  const totalVal = showTRI ? result.totalCurrentTRI : result.totalCurrentPrice;
  const multiplier = (totalVal / result.totalInvested).toFixed(1);

  const cellStyle = { padding: "7px 8px", borderBottom: "1px solid var(--border-subtle)", whiteSpace: "nowrap" };
  const headerCell = { ...cellStyle, fontWeight: 600, color: "var(--text-muted)", borderBottom: "2px solid var(--border-strong)", position: "sticky", top: 0, background: "var(--bg-card)", zIndex: 1 };

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Fira Code', 'SF Mono', monospace",
      background: "var(--bg-main)",
      color: "var(--text-primary)",
      minHeight: "100vh",
      padding: "20px 12px",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        
                {/* ═══ THEME AND TITLE HEADER ═══ */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{
            border: "2px solid var(--border-subtle)",
            padding: "14px 16px",
            background: "var(--bg-card)",
            flexGrow: 1,
            marginRight: 12
          }}>
            <h1 style={{ fontSize: 16, margin: 0, color: "#ff6b35", fontWeight: 800, letterSpacing: "-0.3px" }}>
              {config.label} {isLuckiest ? "'Luckiest' Investor — ₹1 Lakh/Year at 52-Week Low" : "'Worst Timing' Investor — ₹1 Lakh/Year at 52-Week High"}
            </h1>
            <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "6px 0 0", lineHeight: 1.5 }}>
              Assumptions: ₹1,00,000 invested each year at the calendar year's {isLuckiest ? "52-week low" : "52-week high"}. 
              Current {config.label}: {config.current.toLocaleString("en-IN")} (Apr 2, 2026). 
              {showTRI ? ` TRI: ~${(config.div * 100).toFixed(1)}% avg dividend yield compounded.` : " No dividends (price return only)."}
            </p>
          </div>
          
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              padding: "10px",
              background: "var(--bg-card)",
              border: "2px solid var(--border-subtle)",
              borderRadius: 4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-primary)"
            }}
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        
        {/* ═══ INDEX TABS ═══ */}
        <div style={{ display: "flex", gap: 0, marginBottom: 12, borderBottom: "1px solid var(--border-subtle)" }}>
          {TAB_CONFIG.map((t, i) => (
            <button key={t.key} onClick={() => setActiveTab(i)} style={{
              padding: "8px 14px",
              fontSize: 10,
              fontFamily: "inherit",
              fontWeight: activeTab === i ? 700 : 400,
              color: activeTab === i ? t.color : "#555",
              background: activeTab === i ? `${t.color}15` : "var(--bg-toggled-off)",
              border: "none",
              borderBottom: activeTab === i ? `2px solid ${t.color}` : "2px solid transparent",
              cursor: "pointer",
              letterSpacing: "0.3px",
            }}>
              {t.label}
            </button>
          ))}
        </div>
        
                {/* ═══ TOGGLES ═══ */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[false, true].map(tri => (
              <button key={String(tri)} onClick={() => setShowTRI(tri)} style={{
                padding: "5px 12px",
                fontSize: 10,
                fontFamily: "inherit",
                border: showTRI === tri ? "1px solid #4ecdc4" : "1px solid var(--border-strong)",
                background: showTRI === tri ? "rgba(78, 205, 196, 0.1)" : "var(--bg-toggled-off)",
                color: showTRI === tri ? "#4ecdc4" : "#555",
                borderRadius: 3,
                cursor: "pointer",
                fontWeight: showTRI === tri ? 600 : 400,
              }}>
                {tri ? "Total Return (TRI)" : "Price Return"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[false, true].map(lucky => (
              <button key={String(lucky)} onClick={() => setIsLuckiest(lucky)} style={{
                padding: "5px 12px",
                fontSize: 10,
                fontFamily: "inherit",
                border: isLuckiest === lucky ? "1px solid #facc15" : "1px solid var(--border-strong)",
                background: isLuckiest === lucky ? "rgba(250, 204, 21, 0.1)" : "var(--bg-toggled-off)",
                color: isLuckiest === lucky ? "#facc15" : "#555",
                borderRadius: 3,
                cursor: "pointer",
                fontWeight: isLuckiest === lucky ? 600 : 400,
              }}>
                {lucky ? "Luckiest (52-Wk Low)" : "Unluckiest (52-Wk High)"}
              </button>
            ))}
          </div>
        </div>
        
        {/* ═══ MAIN TABLE ═══ */}
        <div style={{ 
          border: "1px solid var(--border-subtle)",
          borderRadius: 4,
          overflow: "auto",
          maxHeight: "70vh",
          marginBottom: 16,
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ ...headerCell, textAlign: "center", width: 50 }}>Year</th>
                <th style={{ ...headerCell, textAlign: "right" }}>{isLuckiest ? '52-Wk Low' : '52-Wk High'}</th>
                <th style={{ ...headerCell, textAlign: "left", minWidth: 180 }}>Market Context / Event</th>
                <th style={{ ...headerCell, textAlign: "right" }}>Invested (₹)</th>
                <th style={{ ...headerCell, textAlign: "right", color: showTRI ? "#4ecdc4" : "#888" }}>
                  Current Value (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((r, idx) => {
                const val = showTRI ? r.currentValueTRI : r.currentValuePrice;
                const isGreen = val >= r.invested;
                const intensity = Math.min(1, Math.log10(val / r.invested) / 2);
                const bgColor = isGreen 
                  ? `rgba(34, 197, 94, ${intensity * 0.08})`
                  : `rgba(239, 68, 68, 0.06)`;
                
                return (
                  <tr key={r.year} style={{ background: idx % 2 === 0 ? "var(--bg-table-even)" : "var(--bg-table-odd)" }}>
                    <td style={{ ...cellStyle, textAlign: "center", fontWeight: 700, color: config.color, fontSize: 11 }}>
                      {r.year}
                    </td>
                    <td style={{ ...cellStyle, textAlign: "right", color: "var(--text-muted)" }}>
                      {r.buyPrice.toLocaleString("en-IN")}
                    </td>
                    <td style={{ ...cellStyle, textAlign: "left", color: "var(--text-muted)", fontSize: 10, whiteSpace: "normal", maxWidth: 220 }}>
                      {r.context}
                    </td>
                    <td style={{ ...cellStyle, textAlign: "right", color: "var(--text-dim)" }}>
                      ₹1,00,000
                    </td>
                    <td style={{ 
                      ...cellStyle, 
                      textAlign: "right", 
                      fontWeight: 600,
                      color: isGreen ? "#22c55e" : "#ef4444",
                      background: bgColor,
                      fontSize: 11,
                    }}>
                      {fmt(val)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* ═══ TOTAL ROW ═══ */}
            <tfoot>
              <tr style={{ background: "var(--bg-table-footer)", borderTop: "2px solid var(--border-strong)" }}>
                <td style={{ ...cellStyle, fontWeight: 800, color: "#ff6b35", textAlign: "center" }}>
                  TOTAL
                </td>
                <td style={{ ...cellStyle }}></td>
                <td style={{ ...cellStyle, fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>
                  {years} years of {isLuckiest ? "best-case" : "worst-case"} entries
                </td>
                <td style={{ ...cellStyle, textAlign: "right", fontWeight: 700, color: "var(--text-primary)" }}>
                  {fmtLakh(result.totalInvested)}
                </td>
                <td style={{ 
                  ...cellStyle, 
                  textAlign: "right", 
                  fontWeight: 800, 
                  color: "#4ecdc4",
                  fontSize: 13,
                }}>
                  {fmtLakh(totalVal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* ═══ SUMMARY CARDS ═══ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 8,
          marginBottom: 16,
        }}>
          {[
            { label: "Total Invested", val: fmtLakh(result.totalInvested), c: "#888" },
            { label: showTRI ? "Value (TRI)" : "Value (Price)", val: fmtLakh(totalVal), c: "#4ecdc4" },
            { label: "Wealth Multiple", val: `${multiplier}x`, c: "#ff6b35" },
            { label: "Profit", val: fmtLakh(totalVal - result.totalInvested), c: "#22c55e" },
            { label: showTRI ? "CAGR (TRI)" : "CAGR (Price)", val: `${(showTRI ? result.cagrTRI : result.cagrPrice).toFixed(1)}%`, c: "#facc15" },
          ].map((card, i) => (
            <div key={i} style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 4,
              padding: "10px 8px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3 }}>
                {card.label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: card.c }}>
                {card.val}
              </div>
            </div>
          ))}
        </div>

        {/* ═══ CROSS-INDEX COMPARISON ═══ */}
        <div style={{
          border: "1px solid var(--border-subtle)",
          borderRadius: 4,
          padding: "14px",
          marginBottom: 16,
          background: "var(--bg-card)",
        }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginBottom: 10 }}>
            All Indices — Side by Side
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2a2a3e" }}>
                <th style={{ textAlign: "left", padding: "6px", color: "var(--text-muted)" }}>Index</th>
                <th style={{ textAlign: "right", padding: "6px", color: "var(--text-muted)" }}>Invested</th>
                <th style={{ textAlign: "right", padding: "6px", color: "var(--text-muted)" }}>Price Value</th>
                <th style={{ textAlign: "right", padding: "6px", color: "var(--text-muted)" }}>TRI Value</th>
                <th style={{ textAlign: "right", padding: "6px", color: "var(--text-muted)" }}>TRI Multiple</th>
                <th style={{ textAlign: "right", padding: "6px", color: "var(--text-muted)" }}>CAGR (TRI)</th>
              </tr>
            </thead>
            <tbody>
              {TAB_CONFIG.map((t, i) => {
                const r = allResults[i];
                const m = (r.totalCurrentTRI / r.totalInvested).toFixed(1);
                return (
                  <tr key={t.key} style={{ 
                    borderBottom: "1px solid var(--border-subtle)",
                    background: i === activeTab ? `${t.color}08` : "transparent",
                  }}>
                    <td style={{ padding: "7px 6px", color: t.color, fontWeight: 600 }}>{t.label}</td>
                    <td style={{ textAlign: "right", padding: "7px 6px", color: "var(--text-muted)" }}>{fmtLakh(r.totalInvested)}</td>
                    <td style={{ textAlign: "right", padding: "7px 6px", color: "var(--text-dim)" }}>{fmtLakh(r.totalCurrentPrice)}</td>
                    <td style={{ textAlign: "right", padding: "7px 6px", color: "#4ecdc4", fontWeight: 600 }}>{fmtLakh(r.totalCurrentTRI)}</td>
                    <td style={{ textAlign: "right", padding: "7px 6px", color: "#ff6b35", fontWeight: 700 }}>{m}x</td>
                    <td style={{ textAlign: "right", padding: "7px 6px", color: "#facc15", fontWeight: 700 }}>{r.cagrTRI.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* ═══ KEY INSIGHT ═══ */}
        <div style={{
          borderLeft: "3px solid #ff6b35",
          padding: "14px 16px",
          background: "var(--bg-insight)",
          marginBottom: 16,
          borderRadius: "0 4px 4px 0",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#ff6b35", marginBottom: 6 }}>
            What this proves
          </div>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            {isLuckiest ? 
              <>Even the <strong style={{ color: "var(--text-primary)" }}>world's luckiest investor</strong> — someone who perfectly bought exactly at every market crash bottom — would have turned ₹{years}L into {fmtLakh(totalVal)} on the {config.label}. The key insight: buying the bottom adds incredible wealth over decades, but <strong style={{ color: "#4ecdc4" }}>even terrible timing makes exceptional money</strong> as proven by the worst-timing toggle.</>
              :
              <>Even the <strong style={{ color: "var(--text-primary)" }}>world's unluckiest investor</strong> — someone who ONLY invested at the absolute peak every single year — would have turned ₹{years}L into {fmtLakh(totalVal)} on the {config.label}. The 2008 investment at the GFC peak? Still solidly profitable. The key insight: <strong style={{ color: "#4ecdc4" }}>time in the market always beats timing the market</strong>. Even getting the timing perfectly wrong for {years} consecutive years cannot beat the power of compounding and staying invested.</>
            }
          </p>
        </div>
        
        {/* ═══ METHODOLOGY ═══ */}
        <div style={{ fontSize: 9, color: "var(--text-muted)", lineHeight: 1.6, borderTop: "1px solid var(--border-subtle)", paddingTop: 12 }}>
          <strong style={{ color: "var(--text-muted)" }}>Methodology & Notes:</strong> 52-week highs from NSE India / niftyindices.com and BSE historical data. 
          Nifty Next 50 data available from ~2000, Midcap 150 & Smallcap 250 from ~2005 (indices restructured in 2017-18). 
          TRI approximated using historical avg dividend yields (Sensex: 1.45%, N50: 1.5%, NN50: 1.59%, Mid: 0.85%, Sml: 0.8%) compounded annually — 
          actual TRI would differ based on exact dividend dates. Current values as of April 2, 2026. 
          This is NOT financial advice — it's a study in the power of consistency.
        </div>
      </div>
    </div>
  );
}
