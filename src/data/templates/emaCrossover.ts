import { buildTemplates } from "../../lib/templateScaffold";

export const emaCrossoverCode = buildTemplates({
  name: "EMA Crossover",
  className: "EmaCrossoverStrategy",
  kind: "equity",

  python: {
    config: `
EXCHANGE = {{EXCHANGE}}
SYMBOL = {{SYMBOL}}
FAST_PERIOD = {{FAST_PERIOD}}
SLOW_PERIOD = {{SLOW_PERIOD}}
QUANTITY = {{QUANTITY}}
PRODUCT_TYPE = {{PRODUCT_TYPE}}  # Use the product codes defined by the TradeSmart API
ORDER_TYPE = {{ORDER_TYPE}}
CANDLE_INTERVAL = "5m"  # Placeholder - use the interval format the TradeSmart API expects
`,
    logic: `
def calculate_ema(values: list[float], period: int) -> list[float | None]:
    """Exponential moving average, seeded with a simple average of the first \`period\` values."""
    ema: list[float | None] = [None] * len(values)
    if len(values) < period:
        return ema
    k = 2 / (period + 1)
    ema[period - 1] = sum(values[:period]) / period
    for i in range(period, len(values)):
        ema[i] = values[i] * k + ema[i - 1] * (1 - k)
    return ema


def generate_signal(closes: list[float]) -> str:
    """BUY on a bullish crossover, SELL on a bearish crossover, otherwise HOLD."""
    if len(closes) < max(FAST_PERIOD, SLOW_PERIOD) + 1:
        return "HOLD"

    fast_ema = calculate_ema(closes, FAST_PERIOD)
    slow_ema = calculate_ema(closes, SLOW_PERIOD)

    if fast_ema[-2] <= slow_ema[-2] and fast_ema[-1] > slow_ema[-1]:
        return "BUY"
    if fast_ema[-2] >= slow_ema[-2] and fast_ema[-1] < slow_ema[-1]:
        return "SELL"
    return "HOLD"


def run_strategy(client: TradeSmartClient) -> None:
    print(f"EMA crossover ({FAST_PERIOD}/{SLOW_PERIOD}) on {EXCHANGE}:{SYMBOL}")
    while True:
        candles = client.get_candles(EXCHANGE, SYMBOL, CANDLE_INTERVAL, max(FAST_PERIOD, SLOW_PERIOD) * 3)
        signal = generate_signal([c.close for c in candles])
        position = client.get_net_quantity(EXCHANGE, SYMBOL)

        # Long-only example: enter on BUY when flat, exit on SELL when long.
        if signal == "BUY" and position == 0:
            client.place_order(EXCHANGE, SYMBOL, "BUY", QUANTITY, ORDER_TYPE, PRODUCT_TYPE)
        elif signal == "SELL" and position > 0:
            client.place_order(EXCHANGE, SYMBOL, "SELL", position, ORDER_TYPE, PRODUCT_TYPE)

        time.sleep(POLL_SECONDS)
`,
  },

  node: {
    config: `
const EXCHANGE = {{EXCHANGE}};
const SYMBOL = {{SYMBOL}};
const FAST_PERIOD = {{FAST_PERIOD}};
const SLOW_PERIOD = {{SLOW_PERIOD}};
const QUANTITY = {{QUANTITY}};
const PRODUCT_TYPE = {{PRODUCT_TYPE}}; // Use the product codes defined by the TradeSmart API
const ORDER_TYPE = {{ORDER_TYPE}};
const CANDLE_INTERVAL = "5m"; // Placeholder - use the interval format the TradeSmart API expects
`,
    logic: `
/** Exponential moving average, seeded with a simple average of the first \`period\` values. */
function calculateEma(values, period) {
  const ema = new Array(values.length).fill(null);
  if (values.length < period) return ema;
  const k = 2 / (period + 1);
  ema[period - 1] = values.slice(0, period).reduce((sum, v) => sum + v, 0) / period;
  for (let i = period; i < values.length; i++) {
    ema[i] = values[i] * k + ema[i - 1] * (1 - k);
  }
  return ema;
}

/** BUY on a bullish crossover, SELL on a bearish crossover, otherwise HOLD. */
function generateSignal(closes) {
  const n = closes.length;
  if (n < Math.max(FAST_PERIOD, SLOW_PERIOD) + 1) return "HOLD";

  const fastEma = calculateEma(closes, FAST_PERIOD);
  const slowEma = calculateEma(closes, SLOW_PERIOD);

  if (fastEma[n - 2] <= slowEma[n - 2] && fastEma[n - 1] > slowEma[n - 1]) return "BUY";
  if (fastEma[n - 2] >= slowEma[n - 2] && fastEma[n - 1] < slowEma[n - 1]) return "SELL";
  return "HOLD";
}

async function runStrategy(client) {
  console.log("EMA crossover (" + FAST_PERIOD + "/" + SLOW_PERIOD + ") on " + EXCHANGE + ":" + SYMBOL);
  while (true) {
    const candles = await client.getCandles(EXCHANGE, SYMBOL, CANDLE_INTERVAL, Math.max(FAST_PERIOD, SLOW_PERIOD) * 3);
    const signal = generateSignal(candles.map((c) => c.close));
    const position = await client.getNetQuantity(EXCHANGE, SYMBOL);

    // Long-only example: enter on BUY when flat, exit on SELL when long.
    if (signal === "BUY" && position === 0) {
      await client.placeOrder(EXCHANGE, SYMBOL, "BUY", QUANTITY, ORDER_TYPE, PRODUCT_TYPE);
    } else if (signal === "SELL" && position > 0) {
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
    static final int FAST_PERIOD = {{FAST_PERIOD}};
    static final int SLOW_PERIOD = {{SLOW_PERIOD}};
    static final int QUANTITY = {{QUANTITY}};
    static final String PRODUCT_TYPE = {{PRODUCT_TYPE}}; // Use the product codes defined by the TradeSmart API
    static final String ORDER_TYPE = {{ORDER_TYPE}};
    static final String CANDLE_INTERVAL = "5m"; // Placeholder - use the interval format the TradeSmart API expects
`,
    logic: `
    /** Exponential moving average, seeded with a simple average of the first {@code period} values. */
    static Double[] calculateEma(List<Double> values, int period) {
        Double[] ema = new Double[values.size()];
        if (values.size() < period) return ema;
        double k = 2.0 / (period + 1);
        double sum = 0;
        for (int i = 0; i < period; i++) sum += values.get(i);
        ema[period - 1] = sum / period;
        for (int i = period; i < values.size(); i++) {
            ema[i] = values.get(i) * k + ema[i - 1] * (1 - k);
        }
        return ema;
    }

    /** BUY on a bullish crossover, SELL on a bearish crossover, otherwise HOLD. */
    static String generateSignal(List<Double> closes) {
        int n = closes.size();
        if (n < Math.max(FAST_PERIOD, SLOW_PERIOD) + 1) return "HOLD";

        Double[] fastEma = calculateEma(closes, FAST_PERIOD);
        Double[] slowEma = calculateEma(closes, SLOW_PERIOD);

        if (fastEma[n - 2] <= slowEma[n - 2] && fastEma[n - 1] > slowEma[n - 1]) return "BUY";
        if (fastEma[n - 2] >= slowEma[n - 2] && fastEma[n - 1] < slowEma[n - 1]) return "SELL";
        return "HOLD";
    }

    static void runStrategy(TradeSmartClient client) throws InterruptedException {
        System.out.printf("EMA crossover (%d/%d) on %s:%s%n", FAST_PERIOD, SLOW_PERIOD, EXCHANGE, SYMBOL);
        while (true) {
            List<Candle> candles = client.getCandles(EXCHANGE, SYMBOL, CANDLE_INTERVAL, Math.max(FAST_PERIOD, SLOW_PERIOD) * 3);
            String signal = generateSignal(candles.stream().map(Candle::close).toList());
            int position = client.getNetQuantity(EXCHANGE, SYMBOL);

            // Long-only example: enter on BUY when flat, exit on SELL when long.
            if (signal.equals("BUY") && position == 0) {
                client.placeOrder(EXCHANGE, SYMBOL, "BUY", QUANTITY, ORDER_TYPE, PRODUCT_TYPE);
            } else if (signal.equals("SELL") && position > 0) {
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
    private const int FastPeriod = {{FAST_PERIOD}};
    private const int SlowPeriod = {{SLOW_PERIOD}};
    private const int Quantity = {{QUANTITY}};
    private const string ProductType = {{PRODUCT_TYPE}}; // Use the product codes defined by the TradeSmart API
    private const string OrderType = {{ORDER_TYPE}};
    private const string CandleInterval = "5m"; // Placeholder - use the interval format the TradeSmart API expects
`,
    logic: `
    /// <summary>Exponential moving average, seeded with a simple average of the first values.</summary>
    private static double?[] CalculateEma(IReadOnlyList<double> values, int period)
    {
        var ema = new double?[values.Count];
        if (values.Count < period) return ema;
        double k = 2.0 / (period + 1);
        ema[period - 1] = values.Take(period).Average();
        for (int i = period; i < values.Count; i++)
        {
            ema[i] = values[i] * k + ema[i - 1]!.Value * (1 - k);
        }
        return ema;
    }

    /// <summary>BUY on a bullish crossover, SELL on a bearish crossover, otherwise HOLD.</summary>
    private static string GenerateSignal(IReadOnlyList<double> closes)
    {
        int n = closes.Count;
        if (n < Math.Max(FastPeriod, SlowPeriod) + 1) return "HOLD";

        var fastEma = CalculateEma(closes, FastPeriod);
        var slowEma = CalculateEma(closes, SlowPeriod);

        if (fastEma[n - 2] <= slowEma[n - 2] && fastEma[n - 1] > slowEma[n - 1]) return "BUY";
        if (fastEma[n - 2] >= slowEma[n - 2] && fastEma[n - 1] < slowEma[n - 1]) return "SELL";
        return "HOLD";
    }

    private static void RunStrategy(TradeSmartClient client)
    {
        Console.WriteLine($"EMA crossover ({FastPeriod}/{SlowPeriod}) on {Exchange}:{Symbol}");
        while (true)
        {
            var candles = client.GetCandles(Exchange, Symbol, CandleInterval, Math.Max(FastPeriod, SlowPeriod) * 3);
            var signal = GenerateSignal(candles.Select(c => c.Close).ToList());
            int position = client.GetNetQuantity(Exchange, Symbol);

            // Long-only example: enter on BUY when flat, exit on SELL when long.
            if (signal == "BUY" && position == 0)
                client.PlaceOrder(Exchange, Symbol, "BUY", Quantity, OrderType, ProductType);
            else if (signal == "SELL" && position > 0)
                client.PlaceOrder(Exchange, Symbol, "SELL", position, OrderType, ProductType);

            Thread.Sleep(TimeSpan.FromSeconds(PollSeconds));
        }
    }
`,
  },
});
