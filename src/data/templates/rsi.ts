import { buildTemplates } from "../../lib/templateScaffold";

export const rsiCode = buildTemplates({
  name: "RSI",
  className: "RsiStrategy",
  kind: "equity",

  python: {
    config: `
EXCHANGE = {{EXCHANGE}}
SYMBOL = {{SYMBOL}}
RSI_PERIOD = {{RSI_PERIOD}}
OVERBOUGHT = {{OVERBOUGHT}}
OVERSOLD = {{OVERSOLD}}
QUANTITY = {{QUANTITY}}
PRODUCT_TYPE = "MIS"  # Placeholder - use the product codes defined by the TradeSmart API
ORDER_TYPE = "MARKET"
CANDLE_INTERVAL = "5m"  # Placeholder - use the interval format the TradeSmart API expects
`,
    logic: `
def calculate_rsi(closes: list[float], period: int) -> list[float]:
    """Wilder's RSI. Returns one value per close once \`period\` price changes are available."""
    if len(closes) <= period:
        return []
    changes = [closes[i] - closes[i - 1] for i in range(1, len(closes))]
    gains = [max(change, 0.0) for change in changes]
    losses = [max(-change, 0.0) for change in changes]

    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period
    rsi = [to_rsi(avg_gain, avg_loss)]
    for i in range(period, len(changes)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period
        rsi.append(to_rsi(avg_gain, avg_loss))
    return rsi


def to_rsi(avg_gain: float, avg_loss: float) -> float:
    if avg_loss == 0:
        return 100.0
    return 100 - 100 / (1 + avg_gain / avg_loss)


def generate_signal(closes: list[float]) -> str:
    """BUY when RSI crosses back above OVERSOLD, SELL when it crosses back below OVERBOUGHT."""
    rsi = calculate_rsi(closes, RSI_PERIOD)
    if len(rsi) < 2:
        return "HOLD"
    previous, current = rsi[-2], rsi[-1]
    if previous <= OVERSOLD < current:
        return "BUY"
    if previous >= OVERBOUGHT > current:
        return "SELL"
    return "HOLD"


def run_strategy(client: TradeSmartClient) -> None:
    print(f"RSI({RSI_PERIOD}) {OVERSOLD}/{OVERBOUGHT} on {EXCHANGE}:{SYMBOL}")
    while True:
        candles = client.get_candles(EXCHANGE, SYMBOL, CANDLE_INTERVAL, RSI_PERIOD * 5)
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
const RSI_PERIOD = {{RSI_PERIOD}};
const OVERBOUGHT = {{OVERBOUGHT}};
const OVERSOLD = {{OVERSOLD}};
const QUANTITY = {{QUANTITY}};
const PRODUCT_TYPE = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
const ORDER_TYPE = "MARKET";
const CANDLE_INTERVAL = "5m"; // Placeholder - use the interval format the TradeSmart API expects
`,
    logic: `
/** Wilder's RSI. Returns one value per close once \`period\` price changes are available. */
function calculateRsi(closes, period) {
  if (closes.length <= period) return [];
  const changes = closes.slice(1).map((close, i) => close - closes[i]);
  const gains = changes.map((change) => Math.max(change, 0));
  const losses = changes.map((change) => Math.max(-change, 0));

  let avgGain = gains.slice(0, period).reduce((sum, v) => sum + v, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((sum, v) => sum + v, 0) / period;
  const rsi = [toRsi(avgGain, avgLoss)];
  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    rsi.push(toRsi(avgGain, avgLoss));
  }
  return rsi;
}

function toRsi(avgGain, avgLoss) {
  return avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
}

/** BUY when RSI crosses back above OVERSOLD, SELL when it crosses back below OVERBOUGHT. */
function generateSignal(closes) {
  const rsi = calculateRsi(closes, RSI_PERIOD);
  if (rsi.length < 2) return "HOLD";
  const previous = rsi[rsi.length - 2];
  const current = rsi[rsi.length - 1];
  if (previous <= OVERSOLD && current > OVERSOLD) return "BUY";
  if (previous >= OVERBOUGHT && current < OVERBOUGHT) return "SELL";
  return "HOLD";
}

async function runStrategy(client) {
  console.log("RSI(" + RSI_PERIOD + ") " + OVERSOLD + "/" + OVERBOUGHT + " on " + EXCHANGE + ":" + SYMBOL);
  while (true) {
    const candles = await client.getCandles(EXCHANGE, SYMBOL, CANDLE_INTERVAL, RSI_PERIOD * 5);
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
    static final int RSI_PERIOD = {{RSI_PERIOD}};
    static final double OVERBOUGHT = {{OVERBOUGHT}};
    static final double OVERSOLD = {{OVERSOLD}};
    static final int QUANTITY = {{QUANTITY}};
    static final String PRODUCT_TYPE = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
    static final String ORDER_TYPE = "MARKET";
    static final String CANDLE_INTERVAL = "5m"; // Placeholder - use the interval format the TradeSmart API expects
`,
    logic: `
    /** Wilder's RSI. Returns one value per close once {@code period} price changes are available. */
    static List<Double> calculateRsi(List<Double> closes, int period) {
        List<Double> rsi = new ArrayList<>();
        if (closes.size() <= period) return rsi;

        double avgGain = 0, avgLoss = 0;
        for (int i = 1; i <= period; i++) {
            double change = closes.get(i) - closes.get(i - 1);
            avgGain += Math.max(change, 0);
            avgLoss += Math.max(-change, 0);
        }
        avgGain /= period;
        avgLoss /= period;
        rsi.add(toRsi(avgGain, avgLoss));

        for (int i = period + 1; i < closes.size(); i++) {
            double change = closes.get(i) - closes.get(i - 1);
            avgGain = (avgGain * (period - 1) + Math.max(change, 0)) / period;
            avgLoss = (avgLoss * (period - 1) + Math.max(-change, 0)) / period;
            rsi.add(toRsi(avgGain, avgLoss));
        }
        return rsi;
    }

    static double toRsi(double avgGain, double avgLoss) {
        return avgLoss == 0 ? 100.0 : 100.0 - 100.0 / (1 + avgGain / avgLoss);
    }

    /** BUY when RSI crosses back above OVERSOLD, SELL when it crosses back below OVERBOUGHT. */
    static String generateSignal(List<Double> closes) {
        List<Double> rsi = calculateRsi(closes, RSI_PERIOD);
        if (rsi.size() < 2) return "HOLD";
        double previous = rsi.get(rsi.size() - 2);
        double current = rsi.get(rsi.size() - 1);
        if (previous <= OVERSOLD && current > OVERSOLD) return "BUY";
        if (previous >= OVERBOUGHT && current < OVERBOUGHT) return "SELL";
        return "HOLD";
    }

    static void runStrategy(TradeSmartClient client) throws InterruptedException {
        System.out.printf("RSI(%d) %.1f/%.1f on %s:%s%n", RSI_PERIOD, OVERSOLD, OVERBOUGHT, EXCHANGE, SYMBOL);
        while (true) {
            List<Candle> candles = client.getCandles(EXCHANGE, SYMBOL, CANDLE_INTERVAL, RSI_PERIOD * 5);
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
    private const int RsiPeriod = {{RSI_PERIOD}};
    private const double Overbought = {{OVERBOUGHT}};
    private const double Oversold = {{OVERSOLD}};
    private const int Quantity = {{QUANTITY}};
    private const string ProductType = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
    private const string OrderType = "MARKET";
    private const string CandleInterval = "5m"; // Placeholder - use the interval format the TradeSmart API expects
`,
    logic: `
    /// <summary>Wilder's RSI. Returns one value per close once enough price changes are available.</summary>
    private static List<double> CalculateRsi(IReadOnlyList<double> closes, int period)
    {
        var rsi = new List<double>();
        if (closes.Count <= period) return rsi;

        double avgGain = 0, avgLoss = 0;
        for (int i = 1; i <= period; i++)
        {
            double change = closes[i] - closes[i - 1];
            avgGain += Math.Max(change, 0);
            avgLoss += Math.Max(-change, 0);
        }
        avgGain /= period;
        avgLoss /= period;
        rsi.Add(ToRsi(avgGain, avgLoss));

        for (int i = period + 1; i < closes.Count; i++)
        {
            double change = closes[i] - closes[i - 1];
            avgGain = (avgGain * (period - 1) + Math.Max(change, 0)) / period;
            avgLoss = (avgLoss * (period - 1) + Math.Max(-change, 0)) / period;
            rsi.Add(ToRsi(avgGain, avgLoss));
        }
        return rsi;
    }

    private static double ToRsi(double avgGain, double avgLoss) =>
        avgLoss == 0 ? 100.0 : 100.0 - 100.0 / (1 + avgGain / avgLoss);

    /// <summary>BUY when RSI crosses back above Oversold, SELL when it crosses back below Overbought.</summary>
    private static string GenerateSignal(IReadOnlyList<double> closes)
    {
        var rsi = CalculateRsi(closes, RsiPeriod);
        if (rsi.Count < 2) return "HOLD";
        double previous = rsi[^2], current = rsi[^1];
        if (previous <= Oversold && current > Oversold) return "BUY";
        if (previous >= Overbought && current < Overbought) return "SELL";
        return "HOLD";
    }

    private static void RunStrategy(TradeSmartClient client)
    {
        Console.WriteLine($"RSI({RsiPeriod}) {Oversold}/{Overbought} on {Exchange}:{Symbol}");
        while (true)
        {
            var candles = client.GetCandles(Exchange, Symbol, CandleInterval, RsiPeriod * 5);
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
