import { buildTemplates } from "../../lib/templateScaffold";

export const vwapCode = buildTemplates({
  name: "VWAP",
  className: "VwapStrategy",
  kind: "equity",

  python: {
    config: `
EXCHANGE = {{EXCHANGE}}
SYMBOL = {{SYMBOL}}
SESSION_START = {{SESSION_START}}  # VWAP is anchored at this time each session (HH:MM, exchange time)
ENTRY_THRESHOLD_PCT = {{ENTRY_THRESHOLD_PCT}}  # Enter when price is this % above VWAP
EXIT_THRESHOLD_PCT = {{EXIT_THRESHOLD_PCT}}  # Exit when price is this % below VWAP
QUANTITY = {{QUANTITY}}
PRODUCT_TYPE = "MIS"  # Placeholder - use the product codes defined by the TradeSmart API
ORDER_TYPE = "MARKET"
CANDLE_INTERVAL = "1m"  # Placeholder - use the interval format the TradeSmart API expects
CANDLE_COUNT = 400  # Enough 1-minute candles to cover a full trading session
`,
    logic: `
def calculate_session_vwap(candles: list[Candle]) -> float | None:
    """VWAP of the latest session, using typical price (H + L + C) / 3."""
    if not candles:
        return None
    session_date = candles[-1].timestamp.date()
    session_start = datetime.strptime(SESSION_START, "%H:%M").time()

    cumulative_pv = 0.0
    cumulative_volume = 0.0
    for c in candles:
        if c.timestamp.date() == session_date and c.timestamp.time() >= session_start:
            typical_price = (c.high + c.low + c.close) / 3
            cumulative_pv += typical_price * c.volume
            cumulative_volume += c.volume
    return cumulative_pv / cumulative_volume if cumulative_volume > 0 else None


def generate_signal(price: float, vwap: float, position: int) -> str:
    """Enter long above VWAP by the entry threshold; exit below VWAP by the exit threshold."""
    distance_pct = (price - vwap) / vwap * 100
    if position == 0 and distance_pct >= ENTRY_THRESHOLD_PCT:
        return "BUY"
    if position > 0 and distance_pct <= -EXIT_THRESHOLD_PCT:
        return "SELL"
    return "HOLD"


def run_strategy(client: TradeSmartClient) -> None:
    print(f"VWAP strategy on {EXCHANGE}:{SYMBOL} (session from {SESSION_START})")
    while True:
        candles = client.get_candles(EXCHANGE, SYMBOL, CANDLE_INTERVAL, CANDLE_COUNT)
        vwap = calculate_session_vwap(candles)
        position = client.get_net_quantity(EXCHANGE, SYMBOL)

        if vwap is not None:
            signal = generate_signal(candles[-1].close, vwap, position)
            if signal == "BUY":
                client.place_order(EXCHANGE, SYMBOL, "BUY", QUANTITY, ORDER_TYPE, PRODUCT_TYPE)
            elif signal == "SELL":
                client.place_order(EXCHANGE, SYMBOL, "SELL", position, ORDER_TYPE, PRODUCT_TYPE)

        time.sleep(POLL_SECONDS)
`,
  },

  node: {
    config: `
const EXCHANGE = {{EXCHANGE}};
const SYMBOL = {{SYMBOL}};
const SESSION_START = {{SESSION_START}}; // VWAP is anchored at this time each session (HH:MM, exchange time)
const ENTRY_THRESHOLD_PCT = {{ENTRY_THRESHOLD_PCT}}; // Enter when price is this % above VWAP
const EXIT_THRESHOLD_PCT = {{EXIT_THRESHOLD_PCT}}; // Exit when price is this % below VWAP
const QUANTITY = {{QUANTITY}};
const PRODUCT_TYPE = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
const ORDER_TYPE = "MARKET";
const CANDLE_INTERVAL = "1m"; // Placeholder - use the interval format the TradeSmart API expects
const CANDLE_COUNT = 400; // Enough 1-minute candles to cover a full trading session
`,
    logic: `
/** VWAP of the latest session, using typical price (H + L + C) / 3. */
function calculateSessionVwap(candles) {
  if (candles.length === 0) return null;
  const sessionDay = candles[candles.length - 1].timestamp.toDateString();
  const [hours, minutes] = SESSION_START.split(":").map(Number);
  const sessionStartMinutes = hours * 60 + minutes;

  let cumulativePv = 0;
  let cumulativeVolume = 0;
  for (const c of candles) {
    const candleMinutes = c.timestamp.getHours() * 60 + c.timestamp.getMinutes();
    if (c.timestamp.toDateString() === sessionDay && candleMinutes >= sessionStartMinutes) {
      const typicalPrice = (c.high + c.low + c.close) / 3;
      cumulativePv += typicalPrice * c.volume;
      cumulativeVolume += c.volume;
    }
  }
  return cumulativeVolume > 0 ? cumulativePv / cumulativeVolume : null;
}

/** Enter long above VWAP by the entry threshold; exit below VWAP by the exit threshold. */
function generateSignal(price, vwap, position) {
  const distancePct = ((price - vwap) / vwap) * 100;
  if (position === 0 && distancePct >= ENTRY_THRESHOLD_PCT) return "BUY";
  if (position > 0 && distancePct <= -EXIT_THRESHOLD_PCT) return "SELL";
  return "HOLD";
}

async function runStrategy(client) {
  console.log("VWAP strategy on " + EXCHANGE + ":" + SYMBOL + " (session from " + SESSION_START + ")");
  while (true) {
    const candles = await client.getCandles(EXCHANGE, SYMBOL, CANDLE_INTERVAL, CANDLE_COUNT);
    const vwap = calculateSessionVwap(candles);
    const position = await client.getNetQuantity(EXCHANGE, SYMBOL);

    if (vwap !== null) {
      const signal = generateSignal(candles[candles.length - 1].close, vwap, position);
      if (signal === "BUY") {
        await client.placeOrder(EXCHANGE, SYMBOL, "BUY", QUANTITY, ORDER_TYPE, PRODUCT_TYPE);
      } else if (signal === "SELL") {
        await client.placeOrder(EXCHANGE, SYMBOL, "SELL", position, ORDER_TYPE, PRODUCT_TYPE);
      }
    }

    await sleep(POLL_SECONDS * 1000);
  }
}
`,
  },

  java: {
    config: `
    static final String EXCHANGE = {{EXCHANGE}};
    static final String SYMBOL = {{SYMBOL}};
    static final String SESSION_START = {{SESSION_START}}; // VWAP is anchored at this time each session (HH:MM)
    static final double ENTRY_THRESHOLD_PCT = {{ENTRY_THRESHOLD_PCT}}; // Enter when price is this % above VWAP
    static final double EXIT_THRESHOLD_PCT = {{EXIT_THRESHOLD_PCT}}; // Exit when price is this % below VWAP
    static final int QUANTITY = {{QUANTITY}};
    static final String PRODUCT_TYPE = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
    static final String ORDER_TYPE = "MARKET";
    static final String CANDLE_INTERVAL = "1m"; // Placeholder - use the interval format the TradeSmart API expects
    static final int CANDLE_COUNT = 400; // Enough 1-minute candles to cover a full trading session
`,
    logic: `
    /** VWAP of the latest session, using typical price (H + L + C) / 3. Returns null if unavailable. */
    static Double calculateSessionVwap(List<Candle> candles) {
        if (candles.isEmpty()) return null;
        var sessionDate = candles.get(candles.size() - 1).timestamp().toLocalDate();
        LocalTime sessionStart = LocalTime.parse(SESSION_START);

        double cumulativePv = 0;
        double cumulativeVolume = 0;
        for (Candle c : candles) {
            if (c.timestamp().toLocalDate().equals(sessionDate)
                    && !c.timestamp().toLocalTime().isBefore(sessionStart)) {
                double typicalPrice = (c.high() + c.low() + c.close()) / 3;
                cumulativePv += typicalPrice * c.volume();
                cumulativeVolume += c.volume();
            }
        }
        return cumulativeVolume > 0 ? cumulativePv / cumulativeVolume : null;
    }

    /** Enter long above VWAP by the entry threshold; exit below VWAP by the exit threshold. */
    static String generateSignal(double price, double vwap, int position) {
        double distancePct = (price - vwap) / vwap * 100;
        if (position == 0 && distancePct >= ENTRY_THRESHOLD_PCT) return "BUY";
        if (position > 0 && distancePct <= -EXIT_THRESHOLD_PCT) return "SELL";
        return "HOLD";
    }

    static void runStrategy(TradeSmartClient client) throws InterruptedException {
        System.out.printf("VWAP strategy on %s:%s (session from %s)%n", EXCHANGE, SYMBOL, SESSION_START);
        while (true) {
            List<Candle> candles = client.getCandles(EXCHANGE, SYMBOL, CANDLE_INTERVAL, CANDLE_COUNT);
            Double vwap = calculateSessionVwap(candles);
            int position = client.getNetQuantity(EXCHANGE, SYMBOL);

            if (vwap != null) {
                double lastClose = candles.get(candles.size() - 1).close();
                String signal = generateSignal(lastClose, vwap, position);
                if (signal.equals("BUY")) {
                    client.placeOrder(EXCHANGE, SYMBOL, "BUY", QUANTITY, ORDER_TYPE, PRODUCT_TYPE);
                } else if (signal.equals("SELL")) {
                    client.placeOrder(EXCHANGE, SYMBOL, "SELL", position, ORDER_TYPE, PRODUCT_TYPE);
                }
            }

            Thread.sleep(POLL_SECONDS * 1000L);
        }
    }
`,
  },

  csharp: {
    config: `
    private const string Exchange = {{EXCHANGE}};
    private const string Symbol = {{SYMBOL}};
    private const string SessionStart = {{SESSION_START}}; // VWAP is anchored at this time each session (HH:MM)
    private const double EntryThresholdPct = {{ENTRY_THRESHOLD_PCT}}; // Enter when price is this % above VWAP
    private const double ExitThresholdPct = {{EXIT_THRESHOLD_PCT}}; // Exit when price is this % below VWAP
    private const int Quantity = {{QUANTITY}};
    private const string ProductType = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
    private const string OrderType = "MARKET";
    private const string CandleInterval = "1m"; // Placeholder - use the interval format the TradeSmart API expects
    private const int CandleCount = 400; // Enough 1-minute candles to cover a full trading session
`,
    logic: `
    /// <summary>VWAP of the latest session, using typical price (H + L + C) / 3.</summary>
    private static double? CalculateSessionVwap(IReadOnlyList<Candle> candles)
    {
        if (candles.Count == 0) return null;
        var sessionDate = candles[^1].Timestamp.Date;
        var sessionStart = TimeSpan.Parse(SessionStart);

        double cumulativePv = 0, cumulativeVolume = 0;
        foreach (var c in candles)
        {
            if (c.Timestamp.Date == sessionDate && c.Timestamp.TimeOfDay >= sessionStart)
            {
                double typicalPrice = (c.High + c.Low + c.Close) / 3;
                cumulativePv += typicalPrice * c.Volume;
                cumulativeVolume += c.Volume;
            }
        }
        return cumulativeVolume > 0 ? cumulativePv / cumulativeVolume : null;
    }

    /// <summary>Enter long above VWAP by the entry threshold; exit below VWAP by the exit threshold.</summary>
    private static string GenerateSignal(double price, double vwap, int position)
    {
        double distancePct = (price - vwap) / vwap * 100;
        if (position == 0 && distancePct >= EntryThresholdPct) return "BUY";
        if (position > 0 && distancePct <= -ExitThresholdPct) return "SELL";
        return "HOLD";
    }

    private static void RunStrategy(TradeSmartClient client)
    {
        Console.WriteLine($"VWAP strategy on {Exchange}:{Symbol} (session from {SessionStart})");
        while (true)
        {
            var candles = client.GetCandles(Exchange, Symbol, CandleInterval, CandleCount);
            var vwap = CalculateSessionVwap(candles);
            int position = client.GetNetQuantity(Exchange, Symbol);

            if (vwap is double value)
            {
                var signal = GenerateSignal(candles[^1].Close, value, position);
                if (signal == "BUY")
                    client.PlaceOrder(Exchange, Symbol, "BUY", Quantity, OrderType, ProductType);
                else if (signal == "SELL")
                    client.PlaceOrder(Exchange, Symbol, "SELL", position, OrderType, ProductType);
            }

            Thread.Sleep(TimeSpan.FromSeconds(PollSeconds));
        }
    }
`,
  },
});
