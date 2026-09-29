import type { LanguageKey, Parameter, Strategy } from "../types/strategy";
import { breakoutCode } from "./templates/breakout";
import { emaCrossoverCode } from "./templates/emaCrossover";
import { momentumCode } from "./templates/momentum";
import { rsiCode } from "./templates/rsi";
import { straddleCode } from "./templates/straddle";
import { strangleCode } from "./templates/strangle";
import { vwapCode } from "./templates/vwap";

const ALL_LANGUAGES: LanguageKey[] = ["python", "node", "java", "csharp"];

function fileNames(snake: string, className: string): Record<LanguageKey, string> {
  return {
    python: `${snake}.py`,
    node: `${snake}.js`,
    java: `${className}.java`,
    csharp: `${className}.cs`,
  };
}

/* Shared parameter definitions ------------------------------------------ */

const exchange: Parameter = {
  key: "EXCHANGE",
  label: "Exchange",
  type: "text",
  defaultValue: "NSE",
  description: "Exchange code as defined by the TradeSmart API.",
};

const symbol = (defaultValue = "RELIANCE"): Parameter => ({
  key: "SYMBOL",
  label: "Symbol",
  type: "text",
  defaultValue,
  description: "Trading symbol of the instrument.",
});

const quantity = (defaultValue = "1", description = "Number of shares / units per order."): Parameter => ({
  key: "QUANTITY",
  label: "Quantity",
  type: "integer",
  defaultValue,
  min: 1,
  description,
});

const optionParameters = (): Parameter[] => [
  {
    key: "UNDERLYING",
    label: "Underlying",
    type: "text",
    defaultValue: "NIFTY",
    description: "Underlying index or stock symbol as defined by the TradeSmart API.",
  },
  {
    key: "EXPIRY",
    label: "Expiry",
    type: "text",
    defaultValue: "2026-10-27",
    description: "Option expiry, in the format required by the TradeSmart API.",
  },
];

const optionTiming = (): Parameter[] => [
  quantity("75", "Order quantity per leg. Must be a valid multiple of the contract lot size."),
  {
    key: "ENTRY_TIME",
    label: "Entry time",
    type: "time",
    defaultValue: "09:20",
    description: "Time (exchange time, 24h) at which both legs are opened.",
  },
  {
    key: "EXIT_TIME",
    label: "Exit time",
    type: "time",
    defaultValue: "15:15",
    description: "Time (exchange time, 24h) at which both legs are closed.",
  },
  {
    key: "POSITION_SIDE",
    label: "Position side",
    type: "select",
    options: ["BUY", "SELL"],
    defaultValue: "BUY",
    description: "BUY opens a long position in both legs; SELL opens a short position.",
  },
];

/* Strategies ------------------------------------------------------------ */

export const strategies: Strategy[] = [
  {
    id: "ema-crossover",
    name: "EMA Crossover",
    icon: "ema",
    category: "Technical Analysis",
    description:
      "Identify trend changes using the crossover of fast and slow exponential moving averages.",
    difficulty: "Beginner",
    market: "Equity & Futures",
    tags: ["Technical Analysis", "Intraday", "Python"],
    languages: ALL_LANGUAGES,
    overview: {
      summary:
        "The EMA Crossover strategy compares a fast exponential moving average with a slower one. EMAs weight recent prices more heavily than a simple average, so the fast EMA reacts to price changes sooner. A crossover between the two is commonly used as an indication that the short-term trend may be changing direction.",
      entryConditions: [
        "The fast EMA crosses above the slow EMA on the latest completed candle (bullish crossover).",
        "No existing position is open for the symbol.",
      ],
      exitConditions: [
        "The fast EMA crosses below the slow EMA (bearish crossover) while a long position is open.",
        "You can extend the template with a stop loss, target or time-based exit.",
      ],
      keyParameters: [
        "Fast EMA period - shorter periods react faster but produce more signals.",
        "Slow EMA period - defines the broader trend the fast EMA is compared against.",
        "Candle interval - the timeframe the EMAs are calculated on.",
      ],
      useCases: [
        "Learning how indicator-driven signals are wired to order placement.",
        "Trend-following experiments on liquid equities or futures.",
        "A base template for adding filters such as volume or higher-timeframe trend.",
      ],
      considerations: [
        "Crossovers lag price and can produce repeated false signals in sideways markets.",
        "The template is long-only; short-selling logic must be added deliberately.",
      ],
    },
    parameters: [
      {
        key: "FAST_PERIOD",
        label: "Fast EMA",
        type: "integer",
        defaultValue: "9",
        min: 2,
        max: 500,
        unit: "candles",
        description: "Period of the fast exponential moving average.",
      },
      {
        key: "SLOW_PERIOD",
        label: "Slow EMA",
        type: "integer",
        defaultValue: "21",
        min: 2,
        max: 500,
        unit: "candles",
        description: "Period of the slow exponential moving average.",
      },
      exchange,
      symbol(),
      quantity(),
      {
        key: "PRODUCT_TYPE",
        label: "Product type",
        type: "select",
        options: ["MIS", "CNC", "NRML"],
        defaultValue: "MIS",
        description: "Product code (e.g. intraday or delivery). Confirm the codes in the TradeSmart API docs.",
      },
      {
        key: "ORDER_TYPE",
        label: "Order type",
        type: "select",
        options: ["MARKET", "LIMIT"],
        defaultValue: "MARKET",
        description: "Order type used for entries and exits. LIMIT orders need a price added in code.",
      },
    ],
    fileNames: fileNames("ema_crossover", "EmaCrossoverStrategy"),
    code: emaCrossoverCode,
  },

  {
    id: "rsi-strategy",
    name: "RSI Strategy",
    icon: "rsi",
    category: "Technical Analysis",
    description:
      "Use RSI-based overbought and oversold conditions to generate potential trading signals.",
    difficulty: "Beginner",
    market: "Equity & Futures",
    tags: ["Technical Analysis", "Momentum", "Python"],
    languages: ALL_LANGUAGES,
    overview: {
      summary:
        "The Relative Strength Index (RSI) is a momentum oscillator that measures the speed and size of recent price changes on a scale of 0 to 100. This template uses Wilder's smoothing and treats readings below the oversold level or above the overbought level as zones of interest, acting when RSI moves back out of those zones.",
      entryConditions: [
        "RSI was at or below the oversold level on the previous candle and moves above it on the latest candle.",
        "No existing position is open for the symbol.",
      ],
      exitConditions: [
        "RSI was at or above the overbought level and moves back below it while a long position is open.",
        "Optionally add a stop loss or maximum holding period.",
      ],
      keyParameters: [
        "RSI period - number of candles used in the RSI calculation (14 is a common default).",
        "Overbought / oversold levels - thresholds that define the signal zones.",
      ],
      useCases: [
        "Mean-reversion style experiments on range-bound instruments.",
        "Combining RSI with trend filters from other templates.",
        "Learning how oscillator values are computed from raw candles.",
      ],
      considerations: [
        "RSI can remain overbought or oversold for long periods during strong trends.",
        "Signal quality depends heavily on the chosen timeframe and thresholds.",
      ],
    },
    parameters: [
      {
        key: "RSI_PERIOD",
        label: "RSI period",
        type: "integer",
        defaultValue: "14",
        min: 2,
        max: 200,
        unit: "candles",
        description: "Number of candles used for the RSI calculation.",
      },
      {
        key: "OVERBOUGHT",
        label: "Overbought level",
        type: "decimal",
        defaultValue: "70",
        min: 50,
        max: 100,
        description: "RSI level treated as overbought. Exit when RSI falls back below it.",
      },
      {
        key: "OVERSOLD",
        label: "Oversold level",
        type: "decimal",
        defaultValue: "30",
        min: 0,
        max: 50,
        description: "RSI level treated as oversold. Enter when RSI rises back above it.",
      },
      exchange,
      symbol("INFY"),
      quantity(),
    ],
    fileNames: fileNames("rsi_strategy", "RsiStrategy"),
    code: rsiCode,
  },

  {
    id: "vwap-strategy",
    name: "VWAP Strategy",
    icon: "vwap",
    category: "Technical Analysis",
    description: "Use Volume Weighted Average Price as a reference for intraday trading signals.",
    difficulty: "Intermediate",
    market: "Equity (Intraday)",
    tags: ["Technical Analysis", "Intraday", "Python"],
    languages: ALL_LANGUAGES,
    overview: {
      summary:
        "Volume Weighted Average Price (VWAP) is the average price of an instrument weighted by traded volume, reset at the start of each session. Many intraday participants use it as a reference level. This template calculates session VWAP from intraday candles and compares the latest price with it using percentage thresholds.",
      entryConditions: [
        "The latest close is above session VWAP by at least the entry threshold (%).",
        "No existing position is open for the symbol.",
      ],
      exitConditions: [
        "The latest close falls below session VWAP by at least the exit threshold (%).",
        "Consider adding an end-of-day square-off time for intraday products.",
      ],
      keyParameters: [
        "Session start - the time VWAP is anchored to each day.",
        "Entry threshold - how far above VWAP price must be before entering.",
        "Exit threshold - how far below VWAP price must fall before exiting.",
      ],
      useCases: [
        "Intraday strategies that use VWAP as a directional reference.",
        "Learning how to calculate session-anchored indicators from candle data.",
      ],
      considerations: [
        "VWAP is most meaningful for intraday analysis and resets every session.",
        "Low-volume instruments can produce a less reliable VWAP.",
      ],
    },
    parameters: [
      {
        key: "SESSION_START",
        label: "VWAP session start",
        type: "time",
        defaultValue: "09:15",
        description: "VWAP is calculated from this time each session (exchange time, 24h).",
      },
      {
        key: "ENTRY_THRESHOLD_PCT",
        label: "Entry threshold",
        type: "decimal",
        defaultValue: "0.2",
        min: 0,
        max: 20,
        unit: "%",
        description: "Minimum distance above VWAP required to enter.",
      },
      {
        key: "EXIT_THRESHOLD_PCT",
        label: "Exit threshold",
        type: "decimal",
        defaultValue: "0.1",
        min: 0,
        max: 20,
        unit: "%",
        description: "Distance below VWAP that triggers an exit.",
      },
      exchange,
      symbol("HDFCBANK"),
      quantity(),
    ],
    fileNames: fileNames("vwap_strategy", "VwapStrategy"),
    code: vwapCode,
  },

  {
    id: "straddle",
    name: "Straddle",
    icon: "straddle",
    category: "Options",
    description:
      "Create an options straddle by combining call and put positions around the same strike.",
    difficulty: "Intermediate",
    market: "Index Options",
    tags: ["Options", "Market Neutral", "Python"],
    languages: ALL_LANGUAGES,
    overview: {
      summary:
        "A straddle combines a call and a put option on the same underlying, with the same strike and expiry. A long straddle (buying both) is typically used when a large move is expected in either direction; a short straddle (selling both) is typically used when little movement is expected. This template opens both legs at a set time and closes them at a later time.",
      entryConditions: [
        "At the configured entry time, fetch the underlying's last traded price.",
        "Select the strike (ATM, or one strike above/below) and resolve the call and put contracts.",
        "Place orders for both legs on the configured side (BUY or SELL).",
      ],
      exitConditions: [
        "At the configured exit time, place opposite orders to close both legs.",
        "Add your own stop loss or profit rules for production use.",
      ],
      keyParameters: [
        "Expiry - the option series used for both legs.",
        "Strike selection - ATM or an offset of one strike above / below.",
        "Entry and exit times - the window during which the position is held.",
      ],
      useCases: [
        "Structuring time-based, multi-leg options orders.",
        "Learning how to resolve option contracts from spot price and strike steps.",
      ],
      considerations: [
        "Short option positions can carry large or theoretically unlimited risk and need margin.",
        "Premiums, liquidity, lot sizes and expiry formats must be verified against exchange and API data.",
      ],
    },
    parameters: [
      ...optionParameters(),
      {
        key: "STRIKE_SELECTION",
        label: "Strike selection",
        type: "select",
        options: ["ATM", "ATM+1", "ATM-1"],
        defaultValue: "ATM",
        description: "Strike for both legs: at-the-money, or one strike step above / below.",
      },
      ...optionTiming(),
    ],
    fileNames: fileNames("straddle", "StraddleStrategy"),
    code: straddleCode,
  },

  {
    id: "strangle",
    name: "Strangle",
    icon: "strangle",
    category: "Options",
    description:
      "Implement an options strangle using call and put positions at different strikes.",
    difficulty: "Intermediate",
    market: "Index Options",
    tags: ["Options", "Market Neutral", "Python"],
    languages: ALL_LANGUAGES,
    overview: {
      summary:
        "A strangle combines an out-of-the-money call and an out-of-the-money put on the same underlying and expiry, at different strikes. Compared with a straddle, the legs are placed further from the current price. This template selects strikes as point offsets from the at-the-money strike and manages the position within a time window.",
      entryConditions: [
        "At the configured entry time, fetch the underlying's last traded price and compute the ATM strike.",
        "Call strike = ATM + call offset; put strike = ATM - put offset (rounded to the strike step).",
        "Place orders for both legs on the configured side (BUY or SELL).",
      ],
      exitConditions: [
        "At the configured exit time, place opposite orders to close both legs.",
        "Add your own stop loss or adjustment rules for production use.",
      ],
      keyParameters: [
        "Call and put strike offsets - distance of each leg from the ATM strike.",
        "Expiry - the option series used for both legs.",
        "Entry and exit times - the holding window.",
      ],
      useCases: [
        "Building multi-leg options workflows with independent strikes.",
        "Comparing strike-selection approaches against the straddle template.",
      ],
      considerations: [
        "Short option positions can carry large or theoretically unlimited risk and need margin.",
        "Far out-of-the-money strikes may have low liquidity and wide spreads.",
      ],
    },
    parameters: [
      ...optionParameters(),
      {
        key: "CALL_STRIKE_OFFSET",
        label: "Call strike",
        type: "decimal",
        defaultValue: "200",
        min: 0,
        unit: "pts above ATM",
        description: "Distance of the call leg above the at-the-money strike.",
      },
      {
        key: "PUT_STRIKE_OFFSET",
        label: "Put strike",
        type: "decimal",
        defaultValue: "200",
        min: 0,
        unit: "pts below ATM",
        description: "Distance of the put leg below the at-the-money strike.",
      },
      ...optionTiming(),
    ],
    fileNames: fileNames("strangle", "StrangleStrategy"),
    code: strangleCode,
  },

  {
    id: "momentum-strategy",
    name: "Momentum Strategy",
    icon: "momentum",
    category: "Technical Analysis",
    description:
      "Identify instruments showing strong price movement and generate momentum-based signals.",
    difficulty: "Beginner",
    market: "Equity",
    tags: ["Momentum", "Intraday", "Python"],
    languages: ALL_LANGUAGES,
    overview: {
      summary:
        "Momentum strategies look for instruments whose price has moved strongly in one direction over a recent period. This template measures momentum as the percentage rate of change (ROC) between the latest close and the close a fixed number of candles earlier.",
      entryConditions: [
        "Rate of change over the lookback period is at or above the momentum threshold.",
        "No existing position is open for the symbol.",
      ],
      exitConditions: [
        "Rate of change turns zero or negative while a long position is open.",
        "Optionally add a trailing stop or time-based exit.",
      ],
      keyParameters: [
        "Lookback period - how many candles back momentum is measured.",
        "Momentum threshold - the minimum % change required to enter.",
      ],
      useCases: [
        "Scanning a watchlist for strong movers (extend the loop over multiple symbols).",
        "Learning how simple price-change metrics drive signals.",
      ],
      considerations: [
        "Momentum can reverse sharply; strong past movement does not imply future movement.",
        "Thresholds that suit one instrument or timeframe may not suit another.",
      ],
    },
    parameters: [
      {
        key: "LOOKBACK_PERIOD",
        label: "Lookback period",
        type: "integer",
        defaultValue: "20",
        min: 1,
        max: 500,
        unit: "candles",
        description: "Number of candles used to measure the rate of change.",
      },
      {
        key: "MOMENTUM_THRESHOLD",
        label: "Momentum threshold",
        type: "decimal",
        defaultValue: "2",
        min: 0,
        max: 100,
        unit: "%",
        description: "Minimum rate of change required to generate an entry signal.",
      },
      quantity(),
      exchange,
      symbol("TCS"),
    ],
    fileNames: fileNames("momentum_strategy", "MomentumStrategy"),
    code: momentumCode,
  },

  {
    id: "breakout-strategy",
    name: "Breakout Strategy",
    icon: "breakout",
    category: "Technical Analysis",
    description: "Identify price breakouts beyond defined support and resistance levels.",
    difficulty: "Intermediate",
    market: "Equity & Futures",
    tags: ["Breakout", "Technical Analysis", "Python"],
    languages: ALL_LANGUAGES,
    overview: {
      summary:
        "A breakout occurs when price moves beyond a level it has previously struggled to cross. This template defines resistance as the highest high of the previous N candles and treats a close above that level (plus an optional buffer) as a breakout. Positions are managed with percentage-based stop loss and target levels.",
      entryConditions: [
        "The latest close is above the highest high of the previous lookback candles plus the breakout buffer.",
        "No existing position is open for the symbol.",
      ],
      exitConditions: [
        "Last traded price falls to or below the stop loss (entry price minus stop loss %).",
        "Last traded price rises to or above the target (entry price plus target %).",
      ],
      keyParameters: [
        "Lookback period - candles used to determine the resistance level.",
        "Breakout level buffer - extra % above resistance required to confirm a breakout.",
        "Stop loss and target - percentage distances from the entry price.",
      ],
      useCases: [
        "Range-breakout experiments on liquid equities or futures.",
        "A starting point for adding volume confirmation or support-breakdown (short) logic.",
      ],
      considerations: [
        "Failed breakouts are common; price can quickly return inside the range.",
        "Replace the estimated entry price with the actual fill price from your order book.",
      ],
    },
    parameters: [
      {
        key: "LOOKBACK_PERIOD",
        label: "Lookback period",
        type: "integer",
        defaultValue: "20",
        min: 1,
        max: 500,
        unit: "candles",
        description: "Number of previous candles used to find the resistance level.",
      },
      {
        key: "BREAKOUT_BUFFER_PCT",
        label: "Breakout level buffer",
        type: "decimal",
        defaultValue: "0.1",
        min: 0,
        max: 20,
        unit: "%",
        description: "How far above resistance the close must be to count as a breakout.",
      },
      {
        key: "STOP_LOSS_PCT",
        label: "Stop loss",
        type: "decimal",
        defaultValue: "1",
        min: 0.01,
        max: 50,
        unit: "%",
        description: "Exit when price falls this far below the entry price.",
      },
      {
        key: "TARGET_PCT",
        label: "Target",
        type: "decimal",
        defaultValue: "2",
        min: 0.01,
        max: 100,
        unit: "%",
        description: "Exit when price rises this far above the entry price.",
      },
      quantity(),
      exchange,
      symbol("SBIN"),
    ],
    fileNames: fileNames("breakout_strategy", "BreakoutStrategy"),
    code: breakoutCode,
  },
];

export const FILTERS = [
  "All",
  "Technical Analysis",
  "Options",
  "Intraday",
  "Momentum",
  "Breakout",
] as const;

export type Filter = (typeof FILTERS)[number];

export function matchesFilter(strategy: Strategy, filter: Filter): boolean {
  if (filter === "All") return true;
  return strategy.category === filter || strategy.tags.includes(filter);
}

export function matchesSearch(strategy: Strategy, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [strategy.name, strategy.description, strategy.category, strategy.market, ...strategy.tags]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

export function getStrategy(id: string | undefined): Strategy | undefined {
  return strategies.find((s) => s.id === id);
}
