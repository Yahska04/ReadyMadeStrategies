import { buildTemplates } from "../../lib/templateScaffold";

export const breakoutCode = buildTemplates({
  name: "Breakout",
  className: "BreakoutStrategy",
  kind: "equity",

  python: {
    config: `
EXCHANGE = {{EXCHANGE}}
SYMBOL = {{SYMBOL}}
LOOKBACK_PERIOD = {{LOOKBACK_PERIOD}}  # Candles used to find the resistance level
BREAKOUT_BUFFER_PCT = {{BREAKOUT_BUFFER_PCT}}  # Close must exceed resistance by this %
STOP_LOSS_PCT = {{STOP_LOSS_PCT}}  # Exit if price falls this % below entry
TARGET_PCT = {{TARGET_PCT}}  # Exit if price rises this % above entry
QUANTITY = {{QUANTITY}}
PRODUCT_TYPE = "MIS"  # Placeholder - use the product codes defined by the TradeSmart API
ORDER_TYPE = "MARKET"
CANDLE_INTERVAL = "15m"  # Placeholder - use the interval format the TradeSmart API expects
`,
    logic: `
def breakout_level(candles: list[Candle]) -> float | None:
    """Highest high of the LOOKBACK_PERIOD candles before the latest one, plus the buffer."""
    if len(candles) <= LOOKBACK_PERIOD:
        return None
    resistance = max(c.high for c in candles[-LOOKBACK_PERIOD - 1:-1])
    return resistance * (1 + BREAKOUT_BUFFER_PCT / 100)


def run_strategy(client: TradeSmartClient) -> None:
    print(f"Breakout ({LOOKBACK_PERIOD} candles) on {EXCHANGE}:{SYMBOL}")
    entry_price: float | None = None

    while True:
        position = client.get_net_quantity(EXCHANGE, SYMBOL)

        if position == 0:
            entry_price = None
            candles = client.get_candles(EXCHANGE, SYMBOL, CANDLE_INTERVAL, LOOKBACK_PERIOD + 1)
            level = breakout_level(candles)
            if level is not None and candles[-1].close > level:
                client.place_order(EXCHANGE, SYMBOL, "BUY", QUANTITY, ORDER_TYPE, PRODUCT_TYPE)
                # TODO: replace with the actual average fill price from the TradeSmart order/trade book.
                entry_price = candles[-1].close

        elif entry_price is not None:
            ltp = client.get_ltp(EXCHANGE, SYMBOL)
            stop_loss = entry_price * (1 - STOP_LOSS_PCT / 100)
            target = entry_price * (1 + TARGET_PCT / 100)
            if ltp <= stop_loss or ltp >= target:
                reason = "stop loss" if ltp <= stop_loss else "target"
                print(f"Exit ({reason}) at {ltp:.2f}")
                client.place_order(EXCHANGE, SYMBOL, "SELL", position, ORDER_TYPE, PRODUCT_TYPE)

        time.sleep(POLL_SECONDS)
`,
  },

  node: {
    config: `
const EXCHANGE = {{EXCHANGE}};
const SYMBOL = {{SYMBOL}};
const LOOKBACK_PERIOD = {{LOOKBACK_PERIOD}}; // Candles used to find the resistance level
const BREAKOUT_BUFFER_PCT = {{BREAKOUT_BUFFER_PCT}}; // Close must exceed resistance by this %
const STOP_LOSS_PCT = {{STOP_LOSS_PCT}}; // Exit if price falls this % below entry
const TARGET_PCT = {{TARGET_PCT}}; // Exit if price rises this % above entry
const QUANTITY = {{QUANTITY}};
const PRODUCT_TYPE = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
const ORDER_TYPE = "MARKET";
const CANDLE_INTERVAL = "15m"; // Placeholder - use the interval format the TradeSmart API expects
`,
    logic: `
/** Highest high of the LOOKBACK_PERIOD candles before the latest one, plus the buffer. */
function breakoutLevel(candles) {
  if (candles.length <= LOOKBACK_PERIOD) return null;
  const previous = candles.slice(-LOOKBACK_PERIOD - 1, -1);
  const resistance = Math.max(...previous.map((c) => c.high));
  return resistance * (1 + BREAKOUT_BUFFER_PCT / 100);
}

async function runStrategy(client) {
  console.log("Breakout (" + LOOKBACK_PERIOD + " candles) on " + EXCHANGE + ":" + SYMBOL);
  let entryPrice = null;

  while (true) {
    const position = await client.getNetQuantity(EXCHANGE, SYMBOL);

    if (position === 0) {
      entryPrice = null;
      const candles = await client.getCandles(EXCHANGE, SYMBOL, CANDLE_INTERVAL, LOOKBACK_PERIOD + 1);
      const level = breakoutLevel(candles);
      const lastClose = candles.length ? candles[candles.length - 1].close : null;
      if (level !== null && lastClose > level) {
        await client.placeOrder(EXCHANGE, SYMBOL, "BUY", QUANTITY, ORDER_TYPE, PRODUCT_TYPE);
        // TODO: replace with the actual average fill price from the TradeSmart order/trade book.
        entryPrice = lastClose;
      }
    } else if (entryPrice !== null) {
      const ltp = await client.getLtp(EXCHANGE, SYMBOL);
      const stopLoss = entryPrice * (1 - STOP_LOSS_PCT / 100);
      const target = entryPrice * (1 + TARGET_PCT / 100);
      if (ltp <= stopLoss || ltp >= target) {
        console.log("Exit (" + (ltp <= stopLoss ? "stop loss" : "target") + ") at " + ltp.toFixed(2));
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
    static final int LOOKBACK_PERIOD = {{LOOKBACK_PERIOD}}; // Candles used to find the resistance level
    static final double BREAKOUT_BUFFER_PCT = {{BREAKOUT_BUFFER_PCT}}; // Close must exceed resistance by this %
    static final double STOP_LOSS_PCT = {{STOP_LOSS_PCT}}; // Exit if price falls this % below entry
    static final double TARGET_PCT = {{TARGET_PCT}}; // Exit if price rises this % above entry
    static final int QUANTITY = {{QUANTITY}};
    static final String PRODUCT_TYPE = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
    static final String ORDER_TYPE = "MARKET";
    static final String CANDLE_INTERVAL = "15m"; // Placeholder - use the interval format the TradeSmart API expects
`,
    logic: `
    /** Highest high of the LOOKBACK_PERIOD candles before the latest one, plus the buffer. */
    static Double breakoutLevel(List<Candle> candles) {
        if (candles.size() <= LOOKBACK_PERIOD) return null;
        double resistance = candles.subList(candles.size() - LOOKBACK_PERIOD - 1, candles.size() - 1)
            .stream().mapToDouble(Candle::high).max().orElseThrow();
        return resistance * (1 + BREAKOUT_BUFFER_PCT / 100);
    }

    static void runStrategy(TradeSmartClient client) throws InterruptedException {
        System.out.printf("Breakout (%d candles) on %s:%s%n", LOOKBACK_PERIOD, EXCHANGE, SYMBOL);
        Double entryPrice = null;

        while (true) {
            int position = client.getNetQuantity(EXCHANGE, SYMBOL);

            if (position == 0) {
                entryPrice = null;
                List<Candle> candles = client.getCandles(EXCHANGE, SYMBOL, CANDLE_INTERVAL, LOOKBACK_PERIOD + 1);
                Double level = breakoutLevel(candles);
                if (level != null && candles.get(candles.size() - 1).close() > level) {
                    client.placeOrder(EXCHANGE, SYMBOL, "BUY", QUANTITY, ORDER_TYPE, PRODUCT_TYPE);
                    // TODO: replace with the actual average fill price from the TradeSmart order/trade book.
                    entryPrice = candles.get(candles.size() - 1).close();
                }
            } else if (entryPrice != null) {
                double ltp = client.getLtp(EXCHANGE, SYMBOL);
                double stopLoss = entryPrice * (1 - STOP_LOSS_PCT / 100);
                double target = entryPrice * (1 + TARGET_PCT / 100);
                if (ltp <= stopLoss || ltp >= target) {
                    System.out.printf("Exit (%s) at %.2f%n", ltp <= stopLoss ? "stop loss" : "target", ltp);
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
    private const int LookbackPeriod = {{LOOKBACK_PERIOD}}; // Candles used to find the resistance level
    private const double BreakoutBufferPct = {{BREAKOUT_BUFFER_PCT}}; // Close must exceed resistance by this %
    private const double StopLossPct = {{STOP_LOSS_PCT}}; // Exit if price falls this % below entry
    private const double TargetPct = {{TARGET_PCT}}; // Exit if price rises this % above entry
    private const int Quantity = {{QUANTITY}};
    private const string ProductType = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
    private const string OrderType = "MARKET";
    private const string CandleInterval = "15m"; // Placeholder - use the interval format the TradeSmart API expects
`,
    logic: `
    /// <summary>Highest high of the lookback candles before the latest one, plus the buffer.</summary>
    private static double? BreakoutLevel(IReadOnlyList<Candle> candles)
    {
        if (candles.Count <= LookbackPeriod) return null;
        double resistance = candles
            .Skip(candles.Count - LookbackPeriod - 1)
            .Take(LookbackPeriod)
            .Max(c => c.High);
        return resistance * (1 + BreakoutBufferPct / 100);
    }

    private static void RunStrategy(TradeSmartClient client)
    {
        Console.WriteLine($"Breakout ({LookbackPeriod} candles) on {Exchange}:{Symbol}");
        double? entryPrice = null;

        while (true)
        {
            int position = client.GetNetQuantity(Exchange, Symbol);

            if (position == 0)
            {
                entryPrice = null;
                var candles = client.GetCandles(Exchange, Symbol, CandleInterval, LookbackPeriod + 1);
                var level = BreakoutLevel(candles);
                if (level is double breakout && candles[^1].Close > breakout)
                {
                    client.PlaceOrder(Exchange, Symbol, "BUY", Quantity, OrderType, ProductType);
                    // TODO: replace with the actual average fill price from the TradeSmart order/trade book.
                    entryPrice = candles[^1].Close;
                }
            }
            else if (entryPrice is double entry)
            {
                double ltp = client.GetLtp(Exchange, Symbol);
                double stopLoss = entry * (1 - StopLossPct / 100);
                double target = entry * (1 + TargetPct / 100);
                if (ltp <= stopLoss || ltp >= target)
                {
                    Console.WriteLine($"Exit ({(ltp <= stopLoss ? "stop loss" : "target")}) at {ltp:F2}");
                    client.PlaceOrder(Exchange, Symbol, "SELL", position, OrderType, ProductType);
                }
            }

            Thread.Sleep(TimeSpan.FromSeconds(PollSeconds));
        }
    }
`,
  },
});
