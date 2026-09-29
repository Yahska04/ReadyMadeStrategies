import { buildTemplates } from "../../lib/templateScaffold";

export const momentumCode = buildTemplates({
  name: "Momentum",
  className: "MomentumStrategy",
  kind: "equity",

  python: {
    config: `
EXCHANGE = {{EXCHANGE}}
SYMBOL = {{SYMBOL}}
LOOKBACK_PERIOD = {{LOOKBACK_PERIOD}}  # Number of candles used to measure momentum
MOMENTUM_THRESHOLD = {{MOMENTUM_THRESHOLD}}  # Minimum rate of change (%) required to enter
QUANTITY = {{QUANTITY}}
PRODUCT_TYPE = "MIS"  # Placeholder - use the product codes defined by the TradeSmart API
ORDER_TYPE = "MARKET"
CANDLE_INTERVAL = "15m"  # Placeholder - use the interval format the TradeSmart API expects
`,
    logic: `
def rate_of_change(closes: list[float], lookback: int) -> float | None:
    """Percentage change between the latest close and the close \`lookback\` candles earlier."""
    if len(closes) <= lookback:
        return None
    past = closes[-lookback - 1]
    return (closes[-1] - past) / past * 100


def generate_signal(closes: list[float], position: int) -> str:
    """Enter when momentum exceeds the threshold; exit once momentum turns negative."""
    roc = rate_of_change(closes, LOOKBACK_PERIOD)
    if roc is None:
        return "HOLD"
    if position == 0 and roc >= MOMENTUM_THRESHOLD:
        return "BUY"
    if position > 0 and roc <= 0:
        return "SELL"
    return "HOLD"


def run_strategy(client: TradeSmartClient) -> None:
    print(f"Momentum ({LOOKBACK_PERIOD} candles, >= {MOMENTUM_THRESHOLD}%) on {EXCHANGE}:{SYMBOL}")
    while True:
        candles = client.get_candles(EXCHANGE, SYMBOL, CANDLE_INTERVAL, LOOKBACK_PERIOD + 1)
        position = client.get_net_quantity(EXCHANGE, SYMBOL)
        signal = generate_signal([c.close for c in candles], position)

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
const LOOKBACK_PERIOD = {{LOOKBACK_PERIOD}}; // Number of candles used to measure momentum
const MOMENTUM_THRESHOLD = {{MOMENTUM_THRESHOLD}}; // Minimum rate of change (%) required to enter
const QUANTITY = {{QUANTITY}};
const PRODUCT_TYPE = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
const ORDER_TYPE = "MARKET";
const CANDLE_INTERVAL = "15m"; // Placeholder - use the interval format the TradeSmart API expects
`,
    logic: `
/** Percentage change between the latest close and the close \`lookback\` candles earlier. */
function rateOfChange(closes, lookback) {
  if (closes.length <= lookback) return null;
  const past = closes[closes.length - lookback - 1];
  return ((closes[closes.length - 1] - past) / past) * 100;
}

/** Enter when momentum exceeds the threshold; exit once momentum turns negative. */
function generateSignal(closes, position) {
  const roc = rateOfChange(closes, LOOKBACK_PERIOD);
  if (roc === null) return "HOLD";
  if (position === 0 && roc >= MOMENTUM_THRESHOLD) return "BUY";
  if (position > 0 && roc <= 0) return "SELL";
  return "HOLD";
}

async function runStrategy(client) {
  console.log("Momentum (" + LOOKBACK_PERIOD + " candles, >= " + MOMENTUM_THRESHOLD + "%) on " + EXCHANGE + ":" + SYMBOL);
  while (true) {
    const candles = await client.getCandles(EXCHANGE, SYMBOL, CANDLE_INTERVAL, LOOKBACK_PERIOD + 1);
    const position = await client.getNetQuantity(EXCHANGE, SYMBOL);
    const signal = generateSignal(candles.map((c) => c.close), position);

    if (signal === "BUY") {
      await client.placeOrder(EXCHANGE, SYMBOL, "BUY", QUANTITY, ORDER_TYPE, PRODUCT_TYPE);
    } else if (signal === "SELL") {
      await client.placeOrder(EXCHANGE, SYMBOL, "SELL", position, ORDER_TYPE, PRODUCT_TYPE);
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
    static final int LOOKBACK_PERIOD = {{LOOKBACK_PERIOD}}; // Number of candles used to measure momentum
    static final double MOMENTUM_THRESHOLD = {{MOMENTUM_THRESHOLD}}; // Minimum rate of change (%) required to enter
    static final int QUANTITY = {{QUANTITY}};
    static final String PRODUCT_TYPE = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
    static final String ORDER_TYPE = "MARKET";
    static final String CANDLE_INTERVAL = "15m"; // Placeholder - use the interval format the TradeSmart API expects
`,
    logic: `
    /** Percentage change between the latest close and the close {@code lookback} candles earlier. */
    static Double rateOfChange(List<Double> closes, int lookback) {
        if (closes.size() <= lookback) return null;
        double past = closes.get(closes.size() - lookback - 1);
        return (closes.get(closes.size() - 1) - past) / past * 100;
    }

    /** Enter when momentum exceeds the threshold; exit once momentum turns negative. */
    static String generateSignal(List<Double> closes, int position) {
        Double roc = rateOfChange(closes, LOOKBACK_PERIOD);
        if (roc == null) return "HOLD";
        if (position == 0 && roc >= MOMENTUM_THRESHOLD) return "BUY";
        if (position > 0 && roc <= 0) return "SELL";
        return "HOLD";
    }

    static void runStrategy(TradeSmartClient client) throws InterruptedException {
        System.out.printf("Momentum (%d candles, >= %.2f%%) on %s:%s%n", LOOKBACK_PERIOD, MOMENTUM_THRESHOLD, EXCHANGE, SYMBOL);
        while (true) {
            List<Candle> candles = client.getCandles(EXCHANGE, SYMBOL, CANDLE_INTERVAL, LOOKBACK_PERIOD + 1);
            int position = client.getNetQuantity(EXCHANGE, SYMBOL);
            String signal = generateSignal(candles.stream().map(Candle::close).toList(), position);

            if (signal.equals("BUY")) {
                client.placeOrder(EXCHANGE, SYMBOL, "BUY", QUANTITY, ORDER_TYPE, PRODUCT_TYPE);
            } else if (signal.equals("SELL")) {
                client.placeOrder(EXCHANGE, SYMBOL, "SELL", position, ORDER_TYPE, PRODUCT_TYPE);
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
    private const int LookbackPeriod = {{LOOKBACK_PERIOD}}; // Number of candles used to measure momentum
    private const double MomentumThreshold = {{MOMENTUM_THRESHOLD}}; // Minimum rate of change (%) required to enter
    private const int Quantity = {{QUANTITY}};
    private const string ProductType = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
    private const string OrderType = "MARKET";
    private const string CandleInterval = "15m"; // Placeholder - use the interval format the TradeSmart API expects
`,
    logic: `
    /// <summary>Percentage change between the latest close and the close lookback candles earlier.</summary>
    private static double? RateOfChange(IReadOnlyList<double> closes, int lookback)
    {
        if (closes.Count <= lookback) return null;
        double past = closes[closes.Count - lookback - 1];
        return (closes[^1] - past) / past * 100;
    }

    /// <summary>Enter when momentum exceeds the threshold; exit once momentum turns negative.</summary>
    private static string GenerateSignal(IReadOnlyList<double> closes, int position)
    {
        var roc = RateOfChange(closes, LookbackPeriod);
        if (roc is null) return "HOLD";
        if (position == 0 && roc >= MomentumThreshold) return "BUY";
        if (position > 0 && roc <= 0) return "SELL";
        return "HOLD";
    }

    private static void RunStrategy(TradeSmartClient client)
    {
        Console.WriteLine($"Momentum ({LookbackPeriod} candles, >= {MomentumThreshold}%) on {Exchange}:{Symbol}");
        while (true)
        {
            var candles = client.GetCandles(Exchange, Symbol, CandleInterval, LookbackPeriod + 1);
            int position = client.GetNetQuantity(Exchange, Symbol);
            var signal = GenerateSignal(candles.Select(c => c.Close).ToList(), position);

            if (signal == "BUY")
                client.PlaceOrder(Exchange, Symbol, "BUY", Quantity, OrderType, ProductType);
            else if (signal == "SELL")
                client.PlaceOrder(Exchange, Symbol, "SELL", position, OrderType, ProductType);

            Thread.Sleep(TimeSpan.FromSeconds(PollSeconds));
        }
    }
`,
  },
});
